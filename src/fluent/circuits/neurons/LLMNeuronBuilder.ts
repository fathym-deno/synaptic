import { EaCLLMNeuron } from "../../../eac/neurons/EaCLLMNeuron.ts";
import { NeuronBuilder } from "./NeuronBuilder.ts";

export class LLMNeuronBuilder extends NeuronBuilder<EaCLLMNeuron> {
  constructor(lookup: string, llmLookup: string) {
    super(lookup, { Type: "LLM", LLMLookup: llmLookup });
  }
}
