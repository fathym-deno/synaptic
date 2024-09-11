import { EaCVertexDetails } from "../src.deps.ts";

export type EaCTextSplitterDetails<TType extends string | unknown = unknown> = {
  TransformerLookup?: string;

  Type: TType;
} & EaCVertexDetails;

export function isEaCTextSplitterDetails<TType extends string | unknown = unknown>(
  type: TType,
  details: unknown,
): details is EaCTextSplitterDetails {
  const x = details as EaCTextSplitterDetails;

  return x && (!type || x.Type === type);
}
