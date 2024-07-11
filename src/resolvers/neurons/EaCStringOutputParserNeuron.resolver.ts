import { SynapticNeuronResolver } from "../SynapticNeuronResolver.ts";
import { SynapticResolverConfiguration } from "../SynapticResolverConfiguration.ts";
import { EaCStringOutputParserNeuron } from "../../eac/neurons/EaCStringOutputParserNeuron.ts";
import { StringOutputParser } from "../../src.deps.ts";

export const SynapticResolverConfig: SynapticResolverConfiguration = {
  Type: "neuron",
  NeuronType: "StringOutputParser",
};

export default {
  Resolve() {
    return new StringOutputParser();
  },
} as SynapticNeuronResolver<EaCStringOutputParserNeuron>;
