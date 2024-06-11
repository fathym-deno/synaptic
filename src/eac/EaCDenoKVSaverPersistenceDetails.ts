import {
  EaCPersistenceDetails,
  isEaCPersistenceDetails,
} from "./EaCPersistenceDetails.ts";

export type EaCDenoKVSaverPersistenceDetails = {
  CheckpointTTL?: number;

  DatabaseLookup: string;

  RootKey: Deno.KvKey;
} & EaCPersistenceDetails<"DenoKVSaver">;

export function isEaCDenoKVSaverPersistenceDetails(
  details: unknown,
): details is EaCDenoKVSaverPersistenceDetails {
  const x = details as EaCDenoKVSaverPersistenceDetails;

  return (
    isEaCPersistenceDetails("DenoKVSaver", x) &&
    x.DatabaseLookup !== undefined &&
    typeof x.DatabaseLookup === "string" &&
    x.RootKey !== undefined &&
    Array.isArray(x.RootKey)
  );
}
