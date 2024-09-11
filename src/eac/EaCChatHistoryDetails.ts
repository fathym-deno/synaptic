import { EaCVertexDetails } from "../src.deps.ts";

export type EaCChatHistoryDetails<TType extends string | unknown = unknown> = {
  Type: TType;
} & EaCVertexDetails;

export function isEaCChatHistoryDetails<TType extends string | unknown = unknown>(
  type: TType,
  details: unknown,
): details is EaCChatHistoryDetails {
  const x = details as EaCChatHistoryDetails;

  return x && (!type || x.Type === type);
}
