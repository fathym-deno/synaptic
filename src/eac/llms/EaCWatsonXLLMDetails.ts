import { EaCLLMDetails, isEaCLLMDetails } from "./EaCLLMDetails.ts";

export type EaCWatsonXLLMDetails = {
  ModelID: string;

  ModelParameters?: Record<string, unknown>;

  ProjectID: string;
} & EaCLLMDetails<"WatsonX">;

export function isEaCWatsonXLLMDetails(
  details: unknown,
): details is EaCWatsonXLLMDetails {
  const x = details as EaCWatsonXLLMDetails;

  return (
    isEaCLLMDetails("WatsonX", x) &&
    x.APIKey !== undefined &&
    typeof x.APIKey === "string" &&
    x.ModelID !== undefined &&
    typeof x.ModelID === "string" &&
    x.ProjectID !== undefined &&
    typeof x.ProjectID === "string"
  );
}
