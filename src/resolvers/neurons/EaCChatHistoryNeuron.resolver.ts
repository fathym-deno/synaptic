import { SynapticNeuronResolver } from "../SynapticNeuronResolver.ts";
import { SynapticResolverConfiguration } from "../SynapticResolverConfiguration.ts";
import { EaCChatHistoryNeuron } from "../../eac/neurons/EaCChatHistoryNeuron.ts";
import {
  BaseListChatMessageHistory,
  RunnableWithMessageHistory,
} from "../../src.deps.ts";
import { EaCNeuronLike } from "../../synaptic/EaCNeuron.ts";

export const SynapticResolverConfig: SynapticResolverConfiguration = {
  Type: "neuron",
  Name: "ChatHistory",
};

export default {
  async Resolve(_neuronLookup, neuron, ioc, eac) {
    const neuronResolver = await ioc.Resolve<
      SynapticNeuronResolver<EaCNeuronLike>
    >(ioc.Symbol("SynapticNeuronResolver"));

    const getMessageHistory = await ioc.Resolve<
      (sessionId: string) => BaseListChatMessageHistory
    >(ioc.Symbol("ChatHistory"), neuron.ChatHistoryLookup);

    const rootMessages = neuron.Messages;

    const childRunnable = await neuronResolver.Resolve(
      "ChatNeuron",
      neuron.ChatNeuron,
      ioc,
      eac,
    );

    return new RunnableWithMessageHistory({
      runnable: childRunnable!,
      getMessageHistory: async (sessionId: string) => {
        const chatHistory = getMessageHistory(sessionId);

        const messages = await chatHistory.getMessages();

        if (!messages.length) {
          await chatHistory.addMessages(rootMessages || []);
        }

        return chatHistory;
      },
      inputMessagesKey: neuron.InputKey,
      historyMessagesKey: neuron.HistoryKey,
    });
  },
} as SynapticNeuronResolver<EaCChatHistoryNeuron>;
