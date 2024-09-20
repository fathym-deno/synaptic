import { OpenAIBaseInput } from "../../src.deps.ts";
import { EaCLLMDetails, isEaCLLMDetails } from "./EaCLLMDetails.ts";

export type EaCOpenAILLMDetails = {
  InputParams?: Partial<OpenAIBaseInput>;

  ModelName: string;

  ToolLookups?: string[];

  ToolsAsFunctions?: boolean;
} & EaCLLMDetails<"OpenAI">;

export function isEaCOpenAILLMDetails(
  details: unknown,
): details is EaCOpenAILLMDetails {
  const llmDetails = details as EaCOpenAILLMDetails;

  return (
    isEaCLLMDetails("AzureOpenAI", llmDetails) &&
    llmDetails.APIKey !== undefined &&
    typeof llmDetails.APIKey === "string" &&
    llmDetails.ModelName !== undefined &&
    typeof llmDetails.ModelName === "string"
  );
}
