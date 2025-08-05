// // import { OllamaInput } from "../../src.deps.ts";
// import { EaCLLMDetails, isEaCLLMDetails } from "./EaCLLMDetails.ts";

// export type EaCOllamaLLMDetails = {
//   // InputParams?: Partial<OllamaInput>;

//   ModelName: string;

//   ToolLookups?: string[];

//   ToolsAsFunctions?: boolean;
// } & EaCLLMDetails<"Ollama">;

// export function isEaCOllamaLLMDetails(
//   details: unknown,
// ): details is EaCOllamaLLMDetails {
//   const llmDetails = details as EaCOllamaLLMDetails;

//   return (
//     isEaCLLMDetails("Ollama", llmDetails) &&
//     llmDetails.APIKey !== undefined &&
//     typeof llmDetails.APIKey === "string" &&
//     llmDetails.Instance !== undefined &&
//     typeof llmDetails.Instance === "string" &&
//     llmDetails.ModelName !== undefined &&
//     typeof llmDetails.ModelName === "string"
//   );
// }
