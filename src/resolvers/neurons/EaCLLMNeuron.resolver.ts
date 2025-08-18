// deno-lint-ignore-file no-explicit-any
import { SynapticNeuronResolver } from '../SynapticNeuronResolver.ts';
import { SynapticResolverConfiguration } from '../SynapticResolverConfiguration.ts';
import { EaCLLMNeuron } from '../../eac/neurons/EaCLLMNeuron.ts';
import {
  BaseLanguageModel,
  ChatOpenAI,
  Runnable,
  RunnableLambda,
  mergeWithArrays,
} from '../../src.deps.ts';
import { resolveTools } from '../../plugins/FathymSynapticPlugin.ts';

export const SynapticResolverConfig: SynapticResolverConfiguration = {
  Type: 'neuron',
  Name: 'LLM',
};

function hasKeys(
  o: Record<string, unknown> | undefined | null
): o is Record<string, unknown> {
  return !!o && Object.keys(o).length > 0;
}

export default {
  async Resolve(_neuronLookup, neuron, ioc) {
    // Base model (e.g., ChatOpenAI)
    const baseLLM = (await ioc.Resolve<BaseLanguageModel>(
      ioc.Symbol(BaseLanguageModel.name),
      neuron.LLMLookup
    )) as BaseLanguageModel;

    // Resolve tools once (if any)
    const tools = neuron.ToolLookups?.length
      ? await resolveTools(neuron.ToolLookups, ioc)
      : undefined;

    // Wrap to apply config at invocation time
    const runnable = new RunnableLambda({
      func: async (input: unknown, config?: any) => {
        // 1) Pull `llm` patch from upstream config (ChatPrompt.withConfig)
        const llmPatch =
          config?.configurable?.llmPatch &&
          typeof config.configurable.llmPatch === 'object'
            ? config.configurable.llmPatch
            : {};

        // 3) Bind call options to the base LLM
        //    (only rebind if we actually have options to set)
        let model: Runnable = hasKeys(llmPatch)
          ? ((baseLLM as unknown as ChatOpenAI).bind(
              llmPatch
            ) as unknown as Runnable)
          : (baseLLM as unknown as Runnable);

        // 4) Apply tools if configured (post-bind, so options carry through)
        if (tools?.length) {
          model = (model as unknown as ChatOpenAI).bindTools(
            tools
            // If you support OpenAI "functions" vs "tools", wire it here.
          ) as unknown as Runnable;
        }

        // 5) Invoke with the original config (so callbacks/tracing etc. still flow)
        return await model.invoke(input, config);
      },
    });

    return runnable;
  },
} as SynapticNeuronResolver<EaCLLMNeuron>;
