import { SynapticNeuronResolver } from "../SynapticNeuronResolver.ts";
import { SynapticResolverConfiguration } from "../SynapticResolverConfiguration.ts";
import {
  getPackageLogger,
  Runnable,
  RunnableLambda,
  RunnableMap,
} from "../../src.deps.ts";
import { EaCNeuronLike } from "../../eac/EaCNeuron.ts";

export const SynapticResolverConfig: SynapticResolverConfiguration = {
  Type: "neuron",
  Name: "$neurons",
};

export default {
  async Resolve(_neuronLookup, neurons, ioc, eac) {
    const logger = await getPackageLogger();

    let runnable: Runnable | undefined;

    const neuronLookups = Object.keys(neurons || {});

    if (neurons && neuronLookups.length > 0) {
      const neuronResolver = await ioc.Resolve<
        SynapticNeuronResolver<EaCNeuronLike>
      >(ioc.Symbol("SynapticNeuronResolver"));

      if (neuronLookups.length === 1 && "" in neurons) {
        logger.debug(`Resolving neurons as direct runnable`);

        const neuron = neurons[""];

        runnable = await neuronResolver.Resolve("", neuron, ioc, eac);
      } else {
        logger.debug(`Resolving neurons as runnable map`);

        type fromParams = Parameters<typeof RunnableMap.from>;

        type input = Parameters<typeof RunnableMap.from>;

        const runnables: fromParams[0] = {};

        for (const neuronLookup of neuronLookups) {
          const neuron = neurons[neuronLookup];

          runnables[neuronLookup] =
            (await neuronResolver.Resolve(neuronLookup, neuron, ioc, eac)) ??
              RunnableLambda.from(() => undefined);
        }

        runnable = RunnableMap.from(runnables);
      }
    }

    return runnable;
  },
} as SynapticNeuronResolver<Record<string, EaCNeuronLike> | undefined>;
