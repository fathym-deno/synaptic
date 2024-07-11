import { SynapticNeuronResolver } from "../SynapticNeuronResolver.ts";
import { SynapticResolverConfiguration } from "../SynapticResolverConfiguration.ts";
import { PromptTemplate } from "../../src.deps.ts";
import { EaCPromptNeuron } from "../../eac/neurons/EaCPromptNeuron.ts";

export const SynapticResolverConfig: SynapticResolverConfiguration = {
  Type: "neuron",
  NeuronType: "Prompt",
};

export default {
  Resolve(neuron) {
    return PromptTemplate.fromTemplate(neuron.PromptTemplate);
  },
} as SynapticNeuronResolver<EaCPromptNeuron>;
