import { SynapticNeuronResolver } from "../SynapticNeuronResolver.ts";
import { SynapticResolverConfiguration } from "../SynapticResolverConfiguration.ts";
import { EaCLoaderNeuron } from "../../eac/neurons/EaCLoaderNeuron.ts";
import { Runnable } from "../../src.deps.ts";

export const SynapticResolverConfig: SynapticResolverConfiguration = {
  Type: "neuron",
  Name: "Loader",
};

export default {
  async Resolve(neuron, ioc) {
    return await ioc.Resolve<Runnable>(
      ioc.Symbol("DocumentLoader"),
      neuron.LoaderLookup,
    );
  },
} as SynapticNeuronResolver<EaCLoaderNeuron>;
