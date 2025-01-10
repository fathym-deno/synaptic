import { EaCNeuron, isEaCNeuron } from "../../synaptic/EaCNeuron.ts";

export type EaCRetrieverNeuron = {
  RetrieverLookup: string;
} & EaCNeuron<"Retriever">;

export function isEaCRetrieverNeuron(
  details: unknown,
): details is EaCRetrieverNeuron {
  const x = details as EaCRetrieverNeuron;

  return (
    isEaCNeuron("Retriever", x) &&
    x.RetrieverLookup !== undefined &&
    typeof x.RetrieverLookup === "string"
  );
}
