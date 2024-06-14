import { OpenAIBaseInput } from "../src.deps.ts";
import { EaCLLMDetails, isEaCLLMDetails } from "./EaCLLMDetails.ts";

export type EaCAzureOpenAILLMDetails = {
  DeploymentName: string;

  InputParams?: Partial<OpenAIBaseInput>;

  ModelName: string;

  ToolLookups?: string[];

  ToolsAsFunctions?: boolean;
} & EaCLLMDetails<"AzureOpenAI">;

export function isEaCAzureOpenAILLMDetails(
  details: unknown,
): details is EaCAzureOpenAILLMDetails {
  const llmDetails = details as EaCAzureOpenAILLMDetails;

  return (
    isEaCLLMDetails("AzureOpenAI", llmDetails) &&
    llmDetails.APIKey !== undefined &&
    typeof llmDetails.APIKey === "string" &&
    llmDetails.DeploymentName !== undefined &&
    typeof llmDetails.DeploymentName === "string" &&
    llmDetails.Endpoint !== undefined &&
    typeof llmDetails.Endpoint === "string" &&
    llmDetails.ModelName !== undefined &&
    typeof llmDetails.ModelName === "string"
  );
}
