import { EaCToolDetails, isEaCToolDetails } from "./EaCToolDetails.ts";

export type EaCTavilySearchResultsToolDetails = {
  APIKey: string;
} & EaCToolDetails<"TavilySearchResults">;

export function isEaCTavilySearchResultsToolDetails(
  details: unknown,
): details is EaCTavilySearchResultsToolDetails {
  const x = details as EaCTavilySearchResultsToolDetails;

  return (
    isEaCToolDetails("TavilySearchResults", x) &&
    x.APIKey !== undefined &&
    typeof x.APIKey === "string"
  );
}
