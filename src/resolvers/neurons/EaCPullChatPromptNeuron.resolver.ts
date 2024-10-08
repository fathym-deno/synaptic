import { SynapticNeuronResolver } from "../SynapticNeuronResolver.ts";
import { SynapticResolverConfiguration } from "../SynapticResolverConfiguration.ts";
import { EaCPullChatPromptNeuron } from "../../eac/neurons/EaCPullChatPromptNeuron.ts";
import { pull, Runnable } from "../../src.deps.ts";

export const SynapticResolverConfig: SynapticResolverConfiguration = {
  Type: "neuron",
  Name: "PullChatPrompt",
};

export default {
  async Resolve(_neuronLookup, neuron) {
    return (await pull(neuron.Template)) as unknown as Runnable;
  },
} as SynapticNeuronResolver<EaCPullChatPromptNeuron>;
