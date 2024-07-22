import { Runnable } from '../../src.deps.ts';
import { SynapticNeuronResolver } from '../SynapticNeuronResolver.ts';
import { SynapticResolverConfiguration } from '../SynapticResolverConfiguration.ts';
import { EaCRetrieverNeuron } from '../../eac/neurons/EaCRetrieverNeuron.ts';

export const SynapticResolverConfig: SynapticResolverConfiguration = {
  Type: 'neuron',
  Name: 'Retriever',
};

export default {
  async Resolve(neuron, ioc) {
    const runnable = await ioc.Resolve<Runnable>(
      ioc.Symbol('Retriever'),
      neuron.RetrieverLookup
    );

    return runnable;
  },
} as SynapticNeuronResolver<EaCRetrieverNeuron>;
