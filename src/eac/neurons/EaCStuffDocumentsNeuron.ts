import { EaCNeuron, EaCNeuronLike, isEaCNeuron } from "../../synaptic/EaCNeuron.ts";

export type EaCStuffDocumentsNeuron = {
  DocumentPrompt?: EaCNeuronLike;

  DocumentSeparator?: string;

  LLM: EaCNeuronLike;

  OutputParser?: EaCNeuronLike;

  Prompt: EaCNeuronLike;
} & EaCNeuron<"StuffDocuments">;

export function isEaCStuffDocumentsNeuron(
  details: unknown,
): details is EaCStuffDocumentsNeuron {
  const x = details as EaCStuffDocumentsNeuron;

  return (
    isEaCNeuron("StuffDocuments", x) &&
    x.LLM !== undefined &&
    x.Prompt !== undefined
  );
}
