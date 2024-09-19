import { SynapticNeuronResolver } from "../SynapticNeuronResolver.ts";
import { SynapticResolverConfiguration } from "../SynapticResolverConfiguration.ts";
import { EaCLLMNeuron } from "../../eac/neurons/EaCLLMNeuron.ts";
import {
  BaseLanguageModel,
  ChatOpenAI,
  formatToOpenAIFunction,
  formatToOpenAITool,
  Runnable,
} from "../../src.deps.ts";
import { resolveTools } from "../../plugins/FathymSynapticPlugin.ts";

export const SynapticResolverConfig: SynapticResolverConfiguration = {
  Type: "neuron",
  Name: "LLM",
};

export default {
  async Resolve(_neuronLookup, neuron, ioc) {
    let runnable: Runnable;

    const llm = (await ioc.Resolve<BaseLanguageModel>(
      ioc.Symbol(BaseLanguageModel.name),
      neuron.LLMLookup,
    )) as BaseLanguageModel;

    if (neuron.ToolLookups?.length) {
      const tools = await resolveTools(neuron.ToolLookups, ioc);

      runnable = (llm as unknown as ChatOpenAI).bindTools(
        neuron.ToolsAsFunctions
          ? tools.map(formatToOpenAIFunction)
          : tools.map(formatToOpenAITool),
      );
    } else {
      runnable = llm;
    }

    return runnable;
  },
} as SynapticNeuronResolver<EaCLLMNeuron>;
