import { AzureAISearchQueryType } from "npm:@langchain/community@0.3.51/vectorstores/azure_aisearch";
import {
  EaCVectorStoreDetails,
  isEaCVectorStoreDetails,
} from "./EaCVectorStoreDetails.ts";

export type EaCAzureSearchAIVectorStoreDetails = {
  APIKey: string;

  Endpoint: string;

  IndexName?: string;

  QueryType: AzureAISearchQueryType;
} & EaCVectorStoreDetails<"AzureSearchAI">;

export function isEaCAzureSearchAIVectorStoreDetails(
  details: unknown,
): details is EaCAzureSearchAIVectorStoreDetails {
  const vsDetails = details as EaCAzureSearchAIVectorStoreDetails;

  return (
    isEaCVectorStoreDetails("AzureSearchAI", vsDetails) &&
    vsDetails.APIKey !== undefined &&
    typeof vsDetails.APIKey === "string" &&
    vsDetails.Endpoint !== undefined &&
    typeof vsDetails.Endpoint === "string"
  );
}
