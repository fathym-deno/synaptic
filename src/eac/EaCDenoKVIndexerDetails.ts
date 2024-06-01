import { EaCIndexerDetails, isEaCIndexerDetails } from "./EaCIndexerDetails.ts";

export type EaCDenoKVIndexerDetails = {
  DenoKVDatabaseLookup: string;

  RootKey: Deno.KvKey;
} & EaCIndexerDetails<"DenoKV">;

export function isEaCDenoKVIndexerDetails(
  details: unknown,
): details is EaCDenoKVIndexerDetails {
  const x = details as EaCDenoKVIndexerDetails;

  return (
    isEaCIndexerDetails("DenoKV", x) &&
    x.DenoKVDatabaseLookup !== undefined &&
    typeof x.DenoKVDatabaseLookup === "string" &&
    x.RootKey !== undefined &&
    Array.isArray(x.RootKey)
  );
}
