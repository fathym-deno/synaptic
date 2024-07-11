import { SynapticNeuronResolver } from "../SynapticNeuronResolver.ts";
import { SynapticResolverConfiguration } from "../SynapticResolverConfiguration.ts";
import { Runnable, RunnableMap, RunnablePassthrough } from "../../src.deps.ts";
import { EaCNeuronLike } from "../../eac/EaCNeuron.ts";

export const SynapticResolverConfig: SynapticResolverConfiguration = {
  Type: "neuron",
  NeuronType: "$neurons",
};

export default {
  async Resolve(neurons, ioc, eac) {
    let runnable: Runnable = new RunnablePassthrough();

    const neuronLookups = Object.keys(neurons || {});

    if (neurons && neuronLookups.length > 0) {
      const neuronResolver = await ioc.Resolve<
        SynapticNeuronResolver<EaCNeuronLike>
      >(ioc.Symbol("SynapticNeuronResolver"));

      if (neuronLookups.length === 1 && "" in neurons) {
        const neuron = neurons[""];

        runnable = await neuronResolver.Resolve(neuron, ioc, eac);
      } else {
        type fromParams = Parameters<typeof RunnableMap.from>;

        type input = Parameters<typeof RunnableMap.from>;

        const runnables: fromParams[0] = {};

        for (const neuronLookup of neuronLookups) {
          const neuron = neurons[neuronLookup];

          runnables[neuronLookup] = await neuronResolver.Resolve(
            neuron,
            ioc,
            eac,
          );
        }

        runnable = RunnableMap.from(runnables);
      }
    }

    return runnable;
  },
} as SynapticNeuronResolver<Record<string, EaCNeuronLike> | undefined>;
