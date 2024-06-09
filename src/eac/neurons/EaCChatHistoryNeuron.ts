import { BaseMessage } from "../../src.deps.ts";
import { EaCNeuron, isEaCNeuron } from "../EaCNeuron.ts";

export type EaCChatHistoryNeuron = {
  ChatHistoryLookup: string;

  HistoryKey?: string;

  InputKey?: string;

  Messages?: BaseMessage[];
} & EaCNeuron<"ChatHistory">;

export function isEaCChatHistoryNeuron(
  details: unknown,
): details is EaCChatHistoryNeuron {
  const x = details as EaCChatHistoryNeuron;

  return (
    isEaCNeuron("ChatHistory", x) &&
    x.ChatHistoryLookup !== undefined &&
    typeof x.ChatHistoryLookup === "string"
  );
}
