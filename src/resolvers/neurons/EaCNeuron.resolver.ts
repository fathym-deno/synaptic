import { SynapticNeuronResolver } from '../SynapticNeuronResolver.ts';
import { SynapticResolverConfiguration } from '../SynapticResolverConfiguration.ts';
import {
  merge,
  Runnable,
  RunnableLambda,
  RunnablePassthrough,
} from '../../src.deps.ts';
import { EaCNeuron, EaCNeuronLike, isEaCNeuron } from '../../eac/EaCNeuron.ts';

export const SynapticResolverConfig: SynapticResolverConfiguration = {
  Type: 'neuron',
};

export default {
  async Resolve(neuronLike, ioc, eac) {
    let runnable: Runnable | undefined;

    let neuron: EaCNeuron | undefined;

    if (neuronLike) {
      if (typeof neuronLike === 'string') {
        const lookup = neuronLike;

        neuron = eac.Circuits!.$neurons![lookup];

        if (!neuron) {
          throw new Deno.errors.NotFound(
            `Unable to locate a neuron '${lookup}' in the $neurons bank.`
          );
        }
      } else if (Array.isArray(neuronLike)) {
        const [neoronLookup, neuronOverride] = neuronLike as [
          string,
          EaCNeuron
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
      >(ioc.Symbol('SynapticNeuronResolver'), neuron.Type as string);

      const neuronsResolver = await ioc.Resolve<
        SynapticNeuronResolver<Record<string, EaCNeuronLike> | undefined>
      >(ioc.Symbol('SynapticNeuronResolver'), '$neurons');

      runnable = neuron.Type
        ? await neuronResolver.Resolve(neuron, ioc, eac)
        : runnable;

      const neurons = await neuronsResolver.Resolve(neuron.Neurons, ioc, eac);

      if (neurons) {
        runnable = runnable ? runnable.pipe(neurons) : neurons;
      }

      const synapses = await neuronsResolver.Resolve(neuron.Synapses, ioc, eac);

      if (synapses) {
        runnable = runnable ? runnable.pipe(synapses) : synapses;
      }

      if (neuron.BootstrapInput) {
        const bsInput = RunnableLambda.from(async (s, cfg) => {
          return await(neuron as EaCNeuron).BootstrapInput!(
            s,
            neuron as EaCNeuron,
            cfg
          );
        });

        runnable = runnable ? bsInput.pipe(runnable) : bsInput;
      }

      if (neuron.Bootstrap) {
        runnable = await neuron.Bootstrap(
          runnable ?? new RunnablePassthrough(),
          neuron
        );
      }

      if (neuron.BootstrapOutput) {
        const bsOut = RunnableLambda.from(async (s, cfg) => {
          return await(neuron as EaCNeuron).BootstrapOutput!(
            s,
            neuron as EaCNeuron,
            cfg
          );
        });

        runnable = runnable ? runnable.pipe(bsOut) : bsOut;
      }
    }

    return runnable;
  },
} as SynapticNeuronResolver<EaCNeuronLike>;
