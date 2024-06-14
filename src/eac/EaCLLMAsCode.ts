import { EaCDetails } from "../src.deps.ts";
import { EaCLLMDetails, isEaCLLMDetails } from "./EaCLLMDetails.ts";

export type EaCLLMAsCode = EaCDetails<EaCLLMDetails>;

export function isEaCLLMAsCode(eac: unknown): eac is EaCLLMAsCode {
  const llm = eac as EaCLLMAsCode;

  return llm && isEaCLLMDetails(undefined, llm.Details);
}
