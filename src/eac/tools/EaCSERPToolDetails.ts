import { EaCToolDetails, isEaCToolDetails } from "./EaCToolDetails.ts";

export type EaCSERPToolDetails = {
  APIKey: string;
} & EaCToolDetails<"SERP">;

export function isEaCSERPToolDetails(
  details: unknown,
): details is EaCSERPToolDetails {
  const x = details as EaCSERPToolDetails;

  return (
    isEaCToolDetails("SERP", x) &&
    x.APIKey !== undefined &&
    typeof x.APIKey === "string"
  );
}
