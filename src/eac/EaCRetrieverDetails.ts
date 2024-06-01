import { EaCVertexDetails } from "../src.deps.ts";

export type EaCRetrieverDetails = {
  LoaderLookups: string[];

  IndexerLookup?: string;

  TextSplitterLookup: string;

  VectorStoreLookup: string;
} & EaCVertexDetails;

export function isEaCRetrieverDetails(
  details: unknown,
): details is EaCRetrieverDetails {
  const x = details as EaCRetrieverDetails;

  return (
    x &&
    x.LoaderLookups !== undefined &&
    Array.isArray(x.LoaderLookups) &&
    x.TextSplitterLookup !== undefined &&
    typeof x.TextSplitterLookup === "string" &&
    x.VectorStoreLookup !== undefined &&
    typeof x.VectorStoreLookup === "string"
  );
}
