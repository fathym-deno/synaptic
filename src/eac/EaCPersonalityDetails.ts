import {
  BaseMessagePromptTemplateLike,
  EaCVertexDetails,
} from "../src.deps.ts";

export type EaCPersonalityDetails = {
  Instructions?: string[];

  MaxTokens?: number;

  Messages?: BaseMessagePromptTemplateLike[];

  NewMessages?: BaseMessagePromptTemplateLike[];

  SystemMessages?: string[];

  Temperature?: number;
} & EaCVertexDetails;

export function isEaCPersonalityDetails(
  details: unknown,
): details is EaCPersonalityDetails {
  const x = details as EaCPersonalityDetails;

  return !!x;
}
