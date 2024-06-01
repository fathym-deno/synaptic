import { EaCVertexDetails } from "../src.deps.ts";

export type EaCTextSplitterDetails<TType = unknown> = {
  Type: TType;
} & EaCVertexDetails;

export function isEaCTextSplitterDetails<TType = unknown>(
  type: TType,
  details: unknown,
): details is EaCTextSplitterDetails {
  const x = details as EaCTextSplitterDetails;

  return x && (!type || x.Type === type);
}
