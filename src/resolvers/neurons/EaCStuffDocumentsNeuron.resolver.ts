import { SynapticNeuronResolver } from "../SynapticNeuronResolver.ts";
import { SynapticResolverConfiguration } from "../SynapticResolverConfiguration.ts";
import { EaCStuffDocumentsNeuron } from "../../eac/neurons/EaCStuffDocumentsNeuron.ts";
import { createStuffDocumentsChain, Runnable } from "../../src.deps.ts";
import { EaCNeuronLike } from "../../synaptic/EaCNeuron.ts";

export const SynapticResolverConfig: SynapticResolverConfiguration = {
  Type: "neuron",
  Name: "StuffDocuments",
};

export default {
  async Resolve(_neuronLookup, neuron, ioc, eac) {
    const neuronResolver = await ioc.Resolve<
      SynapticNeuronResolver<EaCNeuronLike>
    >(ioc.Symbol("SynapticNeuronResolver"));

    const llm = await neuronResolver.Resolve("LLM", neuron.LLM, ioc, eac);

    const outputParser = neuron.OutputParser
      ? await neuronResolver.Resolve(
        "OutputParser",
        neuron.OutputParser,
        ioc,
        eac,
      )
      : undefined;

    const prompt = await neuronResolver.Resolve(
      "Prompt",
      neuron.Prompt,
      ioc,
      eac,
    );

    const documentPrompt = neuron.DocumentPrompt
      ? await neuronResolver.Resolve(
        "DocumentPrompt",
        neuron.DocumentPrompt,
        ioc,
        eac,
      )
      : undefined;

    return (await createStuffDocumentsChain({
      llm: llm!,
      prompt: prompt!,
      outputParser: outputParser!,
      documentPrompt: documentPrompt!,
      documentSeparator: neuron.DocumentSeparator,
    })) as unknown as Runnable;
  },
} as SynapticNeuronResolver<EaCStuffDocumentsNeuron>;
