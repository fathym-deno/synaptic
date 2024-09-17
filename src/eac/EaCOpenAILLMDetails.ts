import { OpenAIBaseInput } from "../src.deps.ts";
import { EaCLLMDetails, isEaCLLMDetails } from "./EaCLLMDetails.ts";

export type EaCOpenAILLMDetails = {
  DeploymentName: string;

  InputParams?: Partial<OpenAIBaseInput>;

  ModelName: string;

  ToolLookups?: string[];

  ToolsAsFunctions?: boolean;
} & EaCLLMDetails<"AzureOpenAI">;

export function isEaCOpenAILLMDetails(
  details: unknown,
): details is EaCOpenAILLMDetails {
  const llmDetails = details as EaCOpenAILLMDetails;

  return (
    isEaCLLMDetails("AzureOpenAI", llmDetails) &&
    llmDetails.APIKey !== undefined &&
    typeof llmDetails.APIKey === "string" &&
    llmDetails.DeploymentName !== undefined &&
    typeof llmDetails.DeploymentName === "string" &&
    llmDetails.Instance !== undefined &&
    typeof llmDetails.Instance === "string" &&
    llmDetails.ModelName !== undefined &&
    typeof llmDetails.ModelName === "string"
  );
}
