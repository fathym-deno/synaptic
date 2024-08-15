import { Runnable, VectorStore } from "../../src.deps.ts";
import { SynapticNeuronResolver } from "../SynapticNeuronResolver.ts";
import { SynapticResolverConfiguration } from "../SynapticResolverConfiguration.ts";
import { EaCVectorStoreNeuron } from "../../eac/neurons/EaCVectorStoreNeuron.ts";

export const SynapticResolverConfig: SynapticResolverConfiguration = {
  Type: "neuron",
  Name: "VectorStore",
};

export default {
  async Resolve(_neuronLookup, neuron, ioc) {
    const vectorStore = await ioc.Resolve<VectorStore>(
      ioc.Symbol(VectorStore.name),
      neuron.VectorStoreLookup,
    );

    const runnable: Runnable = vectorStore as unknown as Runnable;

    return runnable;
  },
} as SynapticNeuronResolver<EaCVectorStoreNeuron>;
