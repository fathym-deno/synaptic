import { EaCVertexDetails } from "../src.deps.ts";

export type EaCToolDetails<TType extends string | unknown = unknown> = {
  Type: TType;
} & EaCVertexDetails;

export function isEaCToolDetails<TType extends string | unknown = unknown>(
  type: TType,
  details: unknown,
): details is EaCToolDetails {
  const x = details as EaCToolDetails;

  return x && (!type || x.Type === type);
}
