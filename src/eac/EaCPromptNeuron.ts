import { EaCNeuron, isEaCNeuron } from "./EaCNeuron.ts";

export type EaCPromptNeuron = {
  PromptTemplate: string;
} & EaCNeuron<"Prompt">;

export function isEaCPromptNeuron(
  details: unknown,
): details is EaCPromptNeuron {
  const x = details as EaCPromptNeuron;

  return (
    isEaCNeuron("Prompt", x) &&
    x.PromptTemplate !== undefined &&
    typeof x.PromptTemplate === "string"
  );
}
