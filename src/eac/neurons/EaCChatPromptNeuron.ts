import { BaseMessagePromptTemplateLike } from "../../src.deps.ts";
import { EaCNeuron, isEaCNeuron } from "../EaCNeuron.ts";

export type EaCChatPromptNeuron = {
  Messages?: BaseMessagePromptTemplateLike[];

  NewMessages?: BaseMessagePromptTemplateLike[];

  SystemMessage?: string;
} & EaCNeuron<"ChatPrompt">;

export function isEaCChatPromptNeuron(
  details: unknown,
): details is EaCChatPromptNeuron {
  const x = details as EaCChatPromptNeuron;

  return isEaCNeuron("ChatPrompt", x);
}
