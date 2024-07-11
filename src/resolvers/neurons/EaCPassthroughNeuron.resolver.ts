import { SynapticNeuronResolver } from "../SynapticNeuronResolver.ts";
import { SynapticResolverConfiguration } from "../SynapticResolverConfiguration.ts";
import { EaCPassthroughNeuron } from "../../eac/neurons/EaCPassthroughNeuron.ts";
import { JSONPathRunnablePassthrough } from "../../runnables/JSONPathRunnablePassthrough.ts";
import { RunnablePassthrough } from "../../src.deps.ts";

export const SynapticResolverConfig: SynapticResolverConfiguration = {
  Type: "neuron",
  NeuronType: "Passthrough",
};

export default {
  Resolve(neuron) {
    return neuron.Field
      ? new JSONPathRunnablePassthrough(neuron.Field)
      : new RunnablePassthrough();
  },
} as SynapticNeuronResolver<EaCPassthroughNeuron>;
