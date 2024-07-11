import { SynapticNeuronResolver } from "../SynapticNeuronResolver.ts";
import { SynapticResolverConfiguration } from "../SynapticResolverConfiguration.ts";
import { EaCCircuitNeuron } from "../../eac/neurons/EaCCircuitNeuron.ts";
import { Runnable } from "../../src.deps.ts";

export const SynapticResolverConfig: SynapticResolverConfiguration = {
  Type: "neuron",
  Name: "Circuit",
};

export default {
  async Resolve(neuron, ioc) {
    return await ioc.Resolve<Runnable>(
      ioc.Symbol("Circuit"),
      neuron.CircuitLookup,
    );
  },
} as SynapticNeuronResolver<EaCCircuitNeuron>;
