import { SynapticNeuronResolver } from "../SynapticNeuronResolver.ts";
import { SynapticResolverConfiguration } from "../SynapticResolverConfiguration.ts";
import { EaCOpenAIFunctionsAgentNeuron } from "../../eac/neurons/EaCOpenAIFunctionsAgentNeuron.ts";
import { createOpenAIFunctionsAgent, Runnable } from "../../src.deps.ts";
import { EaCNeuronLike } from "../../eac/EaCNeuron.ts";
import { resolveTools } from "../../plugins/FathymSynapticPlugin.ts";

export const SynapticResolverConfig: SynapticResolverConfiguration = {
  Type: "neuron",
  NeuronType: "OpenAIFunctionsAgent",
};

export default {
  async Resolve(neuron, ioc, eac) {
    const neuronResolver = await ioc.Resolve<
      SynapticNeuronResolver<EaCNeuronLike>
    >(ioc.Symbol("SynapticNeuronResolver"));

    const tools = await resolveTools(neuron.ToolLookups, ioc);

    const llm = await neuronResolver.Resolve(neuron.LLM, ioc, eac);

    const prompt = await neuronResolver.Resolve(neuron.Prompt, ioc, eac);

    return (await createOpenAIFunctionsAgent({
      llm,
      prompt,
      tools: tools,
    })) as unknown as Runnable;
  },
} as SynapticNeuronResolver<EaCOpenAIFunctionsAgentNeuron>;
