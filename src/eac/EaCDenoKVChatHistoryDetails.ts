import {
  EaCChatHistoryDetails,
  isEaCChatHistoryDetails,
} from "./EaCChatHistoryDetails.ts";

export type EaCDenoKVChatHistoryDetails = {
  DenoKVDatabaseLookup: string;

  RootKey: Deno.KvKey;
} & EaCChatHistoryDetails<"DenoKV">;

export function isEaCDenoKVChatHistoryDetails(
  details: unknown,
): details is EaCDenoKVChatHistoryDetails {
  const x = details as EaCDenoKVChatHistoryDetails;

  return (
    isEaCChatHistoryDetails("DenoKV", x) &&
    x.DenoKVDatabaseLookup !== undefined &&
    typeof x.DenoKVDatabaseLookup === "string" &&
    x.RootKey !== undefined &&
    Array.isArray(x.RootKey)
  );
}
