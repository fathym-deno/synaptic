import { SynapticNeuronResolver } from "../SynapticNeuronResolver.ts";
import { SynapticResolverConfiguration } from "../SynapticResolverConfiguration.ts";
import { EaCChatPromptNeuron } from "../../eac/neurons/EaCChatPromptNeuron.ts";
import {
  BaseMessagePromptTemplateLike,
  ChatPromptTemplate,
} from "../../src.deps.ts";

export const SynapticResolverConfig: SynapticResolverConfiguration = {
  Type: "neuron",
  Name: "ChatPrompt",
};

export default {
  Resolve(neuron) {
    const messages: BaseMessagePromptTemplateLike[] = [];

    if (neuron.SystemMessage) {
      messages.push(["system", neuron.SystemMessage]);
    }

    if (neuron.Messages) {
      messages.push(...neuron.Messages);
    }

    if (neuron.NewMessages) {
      messages.push(...neuron.NewMessages);
    }

    const template = ChatPromptTemplate.fromMessages(messages);

    return template;
  },
} as SynapticNeuronResolver<EaCChatPromptNeuron>;
