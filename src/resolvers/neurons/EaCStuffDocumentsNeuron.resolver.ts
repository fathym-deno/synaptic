import { SynapticNeuronResolver } from '../SynapticNeuronResolver.ts';
import { SynapticResolverConfiguration } from '../SynapticResolverConfiguration.ts';
import { EaCStuffDocumentsNeuron } from '../../eac/neurons/EaCStuffDocumentsNeuron.ts';
import { createStuffDocumentsChain, Runnable } from '../../src.deps.ts';
import { EaCNeuronLike } from '../../eac/EaCNeuron.ts';

export const SynapticResolverConfig: SynapticResolverConfiguration = {
  Type: 'neuron',
  Name: 'StuffDocuments',
};

export default {
  async Resolve(neuron, ioc, eac) {
    const neuronResolver = await ioc.Resolve<
      SynapticNeuronResolver<EaCNeuronLike>
    >(ioc.Symbol('SynapticNeuronResolver'));

    const llm = await neuronResolver.Resolve(neuron.LLM, ioc, eac);

    const outputParser = neuron.OutputParser
      ? await neuronResolver.Resolve(neuron.OutputParser, ioc, eac)
      : undefined;

    const prompt = await neuronResolver.Resolve(neuron.Prompt, ioc, eac);

    const documentPrompt = neuron.DocumentPrompt
      ? await neuronResolver.Resolve(neuron.DocumentPrompt, ioc, eac)
      : undefined;

    return (await createStuffDocumentsChain({
      llm,
      prompt,
      outputParser,
      documentPrompt,
      documentSeparator: neuron.DocumentSeparator,
    })) as unknown as Runnable;
  },
} as SynapticNeuronResolver<EaCStuffDocumentsNeuron>;
