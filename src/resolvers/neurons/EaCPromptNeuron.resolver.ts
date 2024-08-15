import { SynapticNeuronResolver } from "../SynapticNeuronResolver.ts";
import { SynapticResolverConfiguration } from "../SynapticResolverConfiguration.ts";
import { PromptTemplate } from "../../src.deps.ts";
import { EaCPromptNeuron } from "../../eac/neurons/EaCPromptNeuron.ts";

export const SynapticResolverConfig: SynapticResolverConfiguration = {
  Type: "neuron",
  Name: "Prompt",
};

export default {
  Resolve(_neuronLookup, neuron) {
    return PromptTemplate.fromTemplate(neuron.PromptTemplate);
  },
} as SynapticNeuronResolver<EaCPromptNeuron>;
