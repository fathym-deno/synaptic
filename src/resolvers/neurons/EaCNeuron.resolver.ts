import { SynapticNeuronResolver } from "../SynapticNeuronResolver.ts";
import { SynapticResolverConfiguration } from "../SynapticResolverConfiguration.ts";
import {
  merge,
  Runnable,
  RunnableLambda,
  RunnablePassthrough,
} from "../../src.deps.ts";
import { EaCNeuron, EaCNeuronLike, isEaCNeuron } from "../../eac/EaCNeuron.ts";

export const SynapticResolverConfig: SynapticResolverConfiguration = {
  Type: "neuron",
  // NeuronType: "$default",
};

export default {
  async Resolve(neuronLike, ioc, eac) {
    let runnable: Runnable = new RunnablePassthrough();

    let neuron: EaCNeuron | undefined;

    if (neuronLike) {
      if (typeof neuronLike === "string") {
        const lookup = neuronLike;

        neuron = eac.Circuits!.$neurons![lookup];

        if (!neuron) {
          throw new Deno.errors.NotFound(
            `Unable to locate a neuron '${lookup}' in the $neurons bank.`,
          );
        }
      } else if (Array.isArray(neuronLike)) {
        const [neoronLookup, neuronOverride] = neuronLike as [
          string,
          EaCNeuron,
        ];

        neuron = eac.Circuits!.$neurons![neoronLookup];

        neuron = merge(neuron, neuronOverride);
      } else {
        neuron = neuronLike as EaCNeuron;
      }
    }

    if (isEaCNeuron(undefined, neuron)) {
      const neuronResolver = await ioc.Resolve<
        SynapticNeuronResolver<typeof neuron>
      >(ioc.Symbol("SynapticNeuronResolver"), neuron.Type as string);

      const neuronsResolver = await ioc.Resolve<
        SynapticNeuronResolver<Record<string, EaCNeuronLike> | undefined>
      >(ioc.Symbol("SynapticNeuronResolver"), "$neurons");

      runnable = neuron.Type
        ? await neuronResolver.Resolve(neuron, ioc, eac)
        : runnable;

      const neurons = await neuronsResolver.Resolve(neuron.Neurons, ioc, eac);

      if (neurons) {
        runnable = runnable.pipe(neurons);
      }

      const synapses = await neuronsResolver.Resolve(neuron.Synapses, ioc, eac);

      if (synapses) {
        runnable = runnable.pipe(synapses);
      }

      if (neuron.BootstrapInput) {
        runnable = RunnableLambda.from(async (s, cfg) => {
          return await (neuron as EaCNeuron).BootstrapInput!(
            s,
            neuron as EaCNeuron,
            cfg,
          );
        }).pipe(runnable);
      }

      if (neuron.Bootstrap) {
        runnable = await neuron.Bootstrap(runnable, neuron);
      }

      if (neuron.BootstrapOutput) {
        runnable = runnable.pipe(
          RunnableLambda.from(async (s, cfg) => {
            return await (neuron as EaCNeuron).BootstrapOutput!(
              s,
              neuron as EaCNeuron,
              cfg,
            );
          }),
        );
      }
    }

    return runnable;
  },
} as SynapticNeuronResolver<EaCNeuronLike>;
