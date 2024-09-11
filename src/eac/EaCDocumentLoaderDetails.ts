import { EaCVertexDetails } from "../src.deps.ts";

export type EaCDocumentLoaderDetails<TType extends string | unknown = unknown> = {
  Type: TType;
} & EaCVertexDetails;

export function isEaCDocumentLoaderDetails<TType extends string | unknown = unknown>(
  type: TType,
  details: unknown,
): details is EaCDocumentLoaderDetails {
  const x = details as EaCDocumentLoaderDetails;

  return x && (!type || x.Type === type);
}
