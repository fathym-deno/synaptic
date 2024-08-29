import { EaCIndexerDetails, isEaCIndexerDetails } from "./EaCIndexerDetails.ts";

export type EaCDFSDocumentLoaderDetails = {
  Documents: string[];

  DFSLookup: string;
} & EaCIndexerDetails<"DFSDocument">;

export function isEaCDFSDocumentLoaderDetails(
  details: unknown,
): details is EaCDFSDocumentLoaderDetails {
  const x = details as EaCDFSDocumentLoaderDetails;

  return (
    isEaCIndexerDetails("DFSDocuments", x) &&
    x.DFSLookups !== undefined &&
    Array.isArray(x.DFSLookups)
  );
}
