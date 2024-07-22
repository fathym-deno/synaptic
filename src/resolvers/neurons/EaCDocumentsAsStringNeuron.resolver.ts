import { SynapticNeuronResolver } from '../SynapticNeuronResolver.ts';
import { SynapticResolverConfiguration } from '../SynapticResolverConfiguration.ts';
import { EaCDocumentsAsStringNeuron } from '../../eac/neurons/EaCDocumentsAsStringNeuron.ts';
import { formatDocumentsAsString, Runnable } from '../../src.deps.ts';

export const SynapticResolverConfig: SynapticResolverConfiguration = {
  Type: 'neuron',
  Name: 'DocumentsAsString',
};

export default {
  Resolve() {
    return formatDocumentsAsString as unknown as Runnable;
  },
} as SynapticNeuronResolver<EaCDocumentsAsStringNeuron>;
