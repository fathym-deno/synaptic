import { SynapticNeuronResolver } from "../SynapticNeuronResolver.ts";
import { SynapticResolverConfiguration } from "../SynapticResolverConfiguration.ts";
import { EaCChatPromptNeuron } from "../../eac/neurons/EaCChatPromptNeuron.ts";
import {
  BaseMessagePromptTemplateLike,
  ChatPromptTemplate,
  mergeWithArrays,
} from "../../src.deps.ts";
import { EaCPersonalityDetails } from "../../eac/EaCPersonalityDetails.ts";

export const SynapticResolverConfig: SynapticResolverConfiguration = {
  Type: "neuron",
  Name: "ChatPrompt",
};

export default {
  async Resolve(neuron, ioc) {
    const messages: BaseMessagePromptTemplateLike[] = [];

    let personality = neuron.PersonalityLookup
      ? await ioc.Resolve<EaCPersonalityDetails>(
        ioc.Symbol("Personality"),
        neuron.PersonalityLookup,
      )
      : {};

    personality = mergeWithArrays(personality, {
      SystemMessages: neuron.SystemMessage ? [neuron.SystemMessage] : [],
      Instructions: neuron.Instructions ?? [],
      Messages: neuron.Messages ?? [],
      NewMessages: neuron.NewMessages ?? [],
    } as EaCPersonalityDetails);

    if (
      personality.SystemMessages?.length ||
      personality.Instructions?.length
    ) {
      let sysMsg = personality.SystemMessages?.join("") ?? "";

      if (personality.Instructions?.length) {
        sysMsg += "\n\n";

        sysMsg += personality.Instructions.join("\n\n");
      }

      messages.push(["system", sysMsg]);
    }

    if (personality.Messages) {
      messages.push(...personality.Messages);
    }

    if (personality.NewMessages) {
      messages.push(...personality.NewMessages);
    }

    const template = ChatPromptTemplate.fromMessages(messages);

    return template;
  },
} as SynapticNeuronResolver<EaCChatPromptNeuron>;
