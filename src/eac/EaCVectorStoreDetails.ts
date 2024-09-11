import { EaCVertexDetails } from "../src.deps.ts";

export type EaCVectorStoreDetails<TType extends string | unknown = unknown> = {
  EmbeddingsLookup: string;

  Type: TType;
} & EaCVertexDetails;

export function isEaCVectorStoreDetails<TType extends string | unknown = unknown>(
  type: TType,
  details: unknown,
): details is EaCVectorStoreDetails {
  const x = details as EaCVectorStoreDetails;

  return (
    x &&
    (!type || x.Type === type) &&
    x.EmbeddingsLookup !== undefined &&
    typeof x.EmbeddingsLookup === "string"
  );
}
