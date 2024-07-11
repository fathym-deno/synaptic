import { EaCNeuron, EaCNeuronLike, isEaCNeuron } from "../EaCNeuron.ts";

export type EaCOpenAIFunctionsAgentNeuron = {
  LLM: EaCNeuronLike;

  Prompt: EaCNeuronLike;

  ToolLookups: string[];
} & EaCNeuron<"OpenAIFunctionsAgent">;

export function isEaCOpenAIFunctionsAgentNeuron(
  details: unknown,
): details is EaCOpenAIFunctionsAgentNeuron {
  const x = details as EaCOpenAIFunctionsAgentNeuron;

  return (
    isEaCNeuron("OpenAIFunctionsAgent", x) &&
    x.LLM !== undefined &&
    x.Prompt !== undefined
  );
}
