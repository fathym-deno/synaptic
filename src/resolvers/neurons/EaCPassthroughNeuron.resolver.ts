import { SynapticNeuronResolver } from "../SynapticNeuronResolver.ts";
import { SynapticResolverConfiguration } from "../SynapticResolverConfiguration.ts";
import { EaCPassthroughNeuron } from "../../eac/neurons/EaCPassthroughNeuron.ts";
import { JSONPathRunnablePassthrough } from "../../runnables/JSONPathRunnablePassthrough.ts";
import { RunnablePassthrough } from "../../src.deps.ts";

export const SynapticResolverConfig: SynapticResolverConfiguration = {
  Type: "neuron",
  Name: "Passthrough",
};

export default {
  Resolve(_neuronLookup, neuron) {
    return neuron.Field
      ? new JSONPathRunnablePassthrough(neuron.Field)
      : new RunnablePassthrough();
  },
} as SynapticNeuronResolver<EaCPassthroughNeuron>;
