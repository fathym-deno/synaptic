import { EaCVertexDetails } from "../../src.deps.ts";

export type EaCChatHistoryDetails<TType = unknown> = {
  Type: TType;
} & EaCVertexDetails;

export function isEaCChatHistoryDetails<TType = unknown>(
  type: TType,
  details: unknown,
): details is EaCChatHistoryDetails {
  const x = details as EaCChatHistoryDetails;

  return x && (!type || x.Type === type);
}
