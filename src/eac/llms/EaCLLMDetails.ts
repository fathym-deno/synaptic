import { EaCVertexDetails } from "../../src.deps.ts";

export type EaCLLMDetails<TType = unknown> = {
  APIKey?: string;

  APIVersion?: string;

  Instance?: string;

  Streaming?: boolean;

  Type: TType;

  Verbose?: boolean;
} & EaCVertexDetails;

export function isEaCLLMDetails<TType = unknown>(
  type: TType,
  details: unknown,
): details is EaCLLMDetails {
  const x = details as EaCLLMDetails;

  return x && (!type || x.Type === type);
}
