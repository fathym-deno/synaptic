import {
  EaCVectorStoreDetails,
  isEaCVectorStoreDetails,
} from "./EaCVectorStoreDetails.ts";

export type EaCHNSWVectorStoreDetails = {
  Space: "l2" | "ip" | "cosine";
} & EaCVectorStoreDetails<"HSNW">;

export function isEaCHNSWVectorStoreDetails(
  details: unknown,
): details is EaCHNSWVectorStoreDetails {
  const vsDetails = details as EaCHNSWVectorStoreDetails;

  return (
    isEaCVectorStoreDetails("HSNW", vsDetails) &&
    vsDetails.Space !== undefined &&
    typeof vsDetails.Space === "string"
  );
}
