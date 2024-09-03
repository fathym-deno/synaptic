import { EaCVertexDetails } from "../src.deps.ts";

export type EaCDocumentLoaderDetails<TType = unknown> = {
  Type: TType;
} & EaCVertexDetails;

export function isEaCDocumentLoaderDetails<TType = unknown>(
  type: TType,
  details: unknown,
): details is EaCDocumentLoaderDetails {
  const x = details as EaCDocumentLoaderDetails;

  return x && (!type || x.Type === type);
}
