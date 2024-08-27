import { SynapticNeuronResolver } from '../SynapticNeuronResolver.ts';
import { Runnable } from '../../src.deps.ts';
import { SynapticResolverConfiguration } from '../SynapticResolverConfiguration.ts';
import {
  EaCCircuitNeuron,
  isEaCCircuitNeuron,
} from '../../eac/neurons/EaCCircuitNeuron.ts';
import { isEaCGraphCircuitDetails } from '../../eac/EaCGraphCircuitDetails.ts';

export const SynapticResolverConfig: SynapticResolverConfiguration = {
  Type: 'neuron',
  Name: 'Circuit',
};

export default {
  async Resolve(_neuronLookup, neuron, ioc, eac) {
    const runnable = await ioc.Resolve<Runnable>(
      ioc.Symbol('Circuit'),
      neuron.CircuitLookup
    );

    // const state =
    //   isEaCCircuitNeuron(neuron) &&
    //   isEaCGraphCircuitDetails(eac.Circuits![neuron.CircuitLookup]?.Details)
    //     ? eac.Circuits?.[neuron.CircuitLookup]?.Details?.State ?? {}
    //     : undefined;

    // const outputKeys = state ? Object.keys(state) : undefined;

    // if (outputKeys) {
    //   debugger;

    //   runnable = runnable.withConfig({ runName: 'Output Key Fix', outputKeys });
    // }

    return runnable;
  },
} as SynapticNeuronResolver<EaCCircuitNeuron>;
