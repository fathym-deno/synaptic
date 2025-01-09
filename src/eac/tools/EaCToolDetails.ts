import { EaCVertexDetails } from "../../src.deps.ts";

export type EaCToolDetails<TType = unknown> = {
  Type: TType;
} & EaCVertexDetails;

export function isEaCToolDetails<TType = unknown>(
  type: TType,
  details: unknown,
): details is EaCToolDetails {
  const x = details as EaCToolDetails;

  return x && (!type || x.Type === type);
}
