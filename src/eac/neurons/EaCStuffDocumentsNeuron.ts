import { EaCNeuron, EaCNeuronLike, isEaCNeuron } from "../EaCNeuron.ts";

export type EaCStuffDocumentsNeuron = {
  LLMNeuron: EaCNeuronLike;
} & EaCNeuron<"StuffDocuments">;

export function isEaCStuffDocumentsNeuron(
  details: unknown,
): details is EaCStuffDocumentsNeuron {
  const x = details as EaCStuffDocumentsNeuron;

  return isEaCNeuron("StuffDocuments", x);
}
