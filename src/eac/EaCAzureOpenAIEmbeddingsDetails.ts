import {
  EaCEmbeddingsDetails,
  isEaCEmbeddingsDetails,
} from "./EaCEmbeddingsDetails.ts";

export type EaCAzureOpenAIEmbeddingsDetails = {
  DeploymentName: string;
} & EaCEmbeddingsDetails<"AzureOpenAI">;

export function isEaCAzureOpenAIEmbeddingsDetails(
  details: unknown,
): details is EaCAzureOpenAIEmbeddingsDetails {
  const llmDetails = details as EaCAzureOpenAIEmbeddingsDetails;

  return (
    isEaCEmbeddingsDetails("AzureOpenAI", llmDetails) &&
    llmDetails.DeploymentName !== undefined &&
    typeof llmDetails.DeploymentName === "string"
  );
}
