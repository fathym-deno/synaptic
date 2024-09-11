import { EaCVertexDetails } from "../src.deps.ts";

export type EaCIndexerDetails<TType extends string | unknown = unknown> = {
  Type: TType;
} & EaCVertexDetails;

export function isEaCIndexerDetails<TType extends string | unknown = unknown>(
  type: TType,
  details: unknown,
): details is EaCIndexerDetails {
  const x = details as EaCIndexerDetails;

  return x && (!type || x.Type === type);
}
