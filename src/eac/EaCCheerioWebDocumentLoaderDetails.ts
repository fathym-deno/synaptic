import {
  EaCDocumentLoaderDetails,
  isEaCDocumentLoaderDetails,
} from "./EaCDocumentLoaderDetails.ts";

export type EaCCheerioWebDocumentLoaderDetails = {
  URL: string;
} & EaCDocumentLoaderDetails<"CheerioWeb">;

export function isEaCCheerioWebDocumentLoaderDetails(
  details: unknown,
): details is EaCCheerioWebDocumentLoaderDetails {
  const vsDetails = details as EaCCheerioWebDocumentLoaderDetails;

  return isEaCDocumentLoaderDetails("CheerioWeb", vsDetails);
}
