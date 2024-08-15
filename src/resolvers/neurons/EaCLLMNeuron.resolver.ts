import { SynapticNeuronResolver } from "../SynapticNeuronResolver.ts";
import { SynapticResolverConfiguration } from "../SynapticResolverConfiguration.ts";
import { EaCLLMNeuron } from "../../eac/neurons/EaCLLMNeuron.ts";
import {
  AzureChatOpenAI,
  BaseLanguageModel,
  convertToOpenAIFunction,
  convertToOpenAITool,
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

    const llm = await ioc.Resolve<BaseLanguageModel>(
      ioc.Symbol(BaseLanguageModel.name),
      neuron.LLMLookup,
    );

    if (neuron.ToolLookups?.length) {
      const tools = await resolveTools(neuron.ToolLookups, ioc);

      runnable = (llm as AzureChatOpenAI).bind({
        functions: neuron.ToolsAsFunctions
          ? tools.map(convertToOpenAIFunction)
          : undefined,
        tools: neuron.ToolsAsFunctions
          ? undefined
          : tools.map(convertToOpenAITool),
      });
    } else {
      runnable = llm;
    }

    return runnable;
  },
} as SynapticNeuronResolver<EaCLLMNeuron>;
