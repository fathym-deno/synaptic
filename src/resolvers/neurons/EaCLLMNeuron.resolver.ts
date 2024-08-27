import { SynapticNeuronResolver } from '../SynapticNeuronResolver.ts';
import { SynapticResolverConfiguration } from '../SynapticResolverConfiguration.ts';
import { EaCLLMNeuron } from '../../eac/neurons/EaCLLMNeuron.ts';
import {
  AzureChatOpenAI,
  BaseLanguageModel,
  formatToOpenAIFunction,
  formatToOpenAITool,
  Runnable,
} from '../../src.deps.ts';
import { resolveTools } from '../../plugins/FathymSynapticPlugin.ts';

export const SynapticResolverConfig: SynapticResolverConfiguration = {
  Type: 'neuron',
  Name: 'LLM',
};

export default {
  async Resolve(_neuronLookup, neuron, ioc) {
    let runnable: Runnable;

    const llm = (await ioc.Resolve<BaseLanguageModel>(
      ioc.Symbol(BaseLanguageModel.name),
      neuron.LLMLookup
    )) as unknown as AzureChatOpenAI;

    if (neuron.ToolLookups?.length) {
      const tools = await resolveTools(neuron.ToolLookups, ioc);

      runnable = llm.bind({
        functions: neuron.ToolsAsFunctions
          ? tools.map(formatToOpenAIFunction)
          : undefined,
        tools: neuron.ToolsAsFunctions
          ? undefined
          : tools.map(formatToOpenAITool),
      }) as unknown as Runnable;
    } else {
      runnable = llm as unknown as Runnable;
    }

    return runnable;
  },
} as SynapticNeuronResolver<EaCLLMNeuron>;
