import {
  EaCVectorStoreDetails,
  isEaCVectorStoreDetails,
} from "./EaCVectorStoreDetails.ts";

export type EaCMemoryVectorStoreDetails = EaCVectorStoreDetails<"Memory">;

export function isEaCMemoryVectorStoreDetails(
  details: unknown,
): details is EaCMemoryVectorStoreDetails {
  const vsDetails = details as EaCMemoryVectorStoreDetails;

  return isEaCVectorStoreDetails("Memory", vsDetails);
}
