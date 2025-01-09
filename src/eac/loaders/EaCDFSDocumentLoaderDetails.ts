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
    x.DFSLookup !== undefined &&
    typeof x.DFSLookup === "string" &&
    x.Documents !== undefined &&
    Array.isArray(x.Documents)
  );
}
