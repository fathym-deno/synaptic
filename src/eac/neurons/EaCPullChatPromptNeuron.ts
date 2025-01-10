import { EaCNeuron, isEaCNeuron } from "../../synaptic/EaCNeuron.ts";

export type EaCPullChatPromptNeuron = {
  Template: string;
} & EaCNeuron<"PullChatPrompt">;

export function isEaCPullChatPromptNeuron(
  details: unknown,
): details is EaCPullChatPromptNeuron {
  const x = details as EaCPullChatPromptNeuron;

  return (
    isEaCNeuron("PullChatPrompt", x) &&
    x.Template !== undefined &&
    typeof x.Template === "string"
  );
}
