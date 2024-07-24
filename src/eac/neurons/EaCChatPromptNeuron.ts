import { BaseMessagePromptTemplateLike } from "../../src.deps.ts";
import { EaCNeuron, isEaCNeuron } from "../EaCNeuron.ts";

export type EaCChatPromptNeuron = {
  Instructions?: string[];

  Messages?: BaseMessagePromptTemplateLike[];

  NewMessages?: BaseMessagePromptTemplateLike[];

  PersonalityLookup?: string;

  SystemMessage?: string;
} & EaCNeuron<"ChatPrompt">;

export function isEaCChatPromptNeuron(
  details: unknown,
): details is EaCChatPromptNeuron {
  const x = details as EaCChatPromptNeuron;

  return isEaCNeuron("ChatPrompt", x);
}
