import { Runnable, VectorStore } from "../../src.deps.ts";
import { SynapticNeuronResolver } from "../SynapticNeuronResolver.ts";
import { SynapticResolverConfiguration } from "../SynapticResolverConfiguration.ts";
import { EaCVectorStoreRetrieverNeuron } from "../../eac/neurons/EaCVectorStoreRetrieverNeuron.ts";

export const SynapticResolverConfig: SynapticResolverConfiguration = {
  Type: "neuron",
  Name: "VectorStoreRetriever",
};

export default {
  async Resolve(_neuronLookup, neuron, ioc) {
    const vectorStore = await ioc.Resolve<VectorStore>(
      ioc.Symbol(VectorStore.name),
      neuron.VectorStoreLookup,
    );

    const runnable: Runnable = vectorStore.asRetriever();

    return runnable;
  },
} as SynapticNeuronResolver<EaCVectorStoreRetrieverNeuron>;
