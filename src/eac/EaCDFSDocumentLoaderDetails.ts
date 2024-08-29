import {
  EaCDocumentLoaderDetails,
  isEaCDocumentLoaderDetails,
} from "./EaCDocumentLoaderDetails.ts";

export type EaCDFSDocumentLoaderDetails = {
  Documents: string[];

  DFSLookup: string;
} & EaCDocumentLoaderDetails<"DFSDocument">;

export function isEaCDFSDocumentLoaderDetails(
  details: unknown,
): details is EaCDFSDocumentLoaderDetails {
  const x = details as EaCDFSDocumentLoaderDetails;

  return (
    isEaCDocumentLoaderDetails("DFSDocument", x) &&
    x.DFSLookups !== undefined &&
    Array.isArray(x.DFSLookups)
  );
}
