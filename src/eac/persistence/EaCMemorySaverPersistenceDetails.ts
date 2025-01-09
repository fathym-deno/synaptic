import {
  EaCPersistenceDetails,
  isEaCPersistenceDetails,
} from "./EaCPersistenceDetails.ts";

export type EaCMemorySaverPersistenceDetails = EaCPersistenceDetails<
  "MemorySaver"
>;

export function isEaCMemorySaverPersistenceDetails(
  details: unknown,
): details is EaCMemorySaverPersistenceDetails {
  const x = details as EaCMemorySaverPersistenceDetails;

  return isEaCPersistenceDetails("MemorySaver", x);
}
