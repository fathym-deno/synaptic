import { createOpenAIFunctionsAgent, Runnable } from "../../src.deps.ts";
import { SynapticNeuronResolver } from "../SynapticNeuronResolver.ts";
import { SynapticResolverConfiguration } from "../SynapticResolverConfiguration.ts";
import { EaCOpenAIFunctionsAgentNeuron } from "../../eac/neurons/EaCOpenAIFunctionsAgentNeuron.ts";
import { EaCNeuronLike } from "../../eac/EaCNeuron.ts";
import { resolveTools } from "../../plugins/FathymSynapticPlugin.ts";

export const SynapticResolverConfig: SynapticResolverConfiguration = {
  Type: "neuron",
  Name: "OpenAIFunctionsAgent",
};

export default {
  async Resolve(_neuronLookup, neuron, ioc, eac) {
    const neuronResolver = await ioc.Resolve<
      SynapticNeuronResolver<EaCNeuronLike>
    >(ioc.Symbol("SynapticNeuronResolver"));

    const tools = await resolveTools(neuron.ToolLookups, ioc);

    const llm = await neuronResolver.Resolve("LLM", neuron.LLM, ioc, eac);

    const prompt = await neuronResolver.Resolve(
      "Promp",
      neuron.Prompt,
      ioc,
      eac,
    );

    return (await createOpenAIFunctionsAgent({
      llm: llm!,
      prompt: prompt!,
      tools: tools,
    })) as unknown as Runnable;
  },
} as SynapticNeuronResolver<EaCOpenAIFunctionsAgentNeuron>;
