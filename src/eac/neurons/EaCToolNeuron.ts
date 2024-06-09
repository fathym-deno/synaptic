import { EaCNeuron, isEaCNeuron } from "../EaCNeuron.ts";

export type EaCToolNeuron = {
  ToolLookup: string;
} & EaCNeuron<"Tool">;

export function isEaCToolNeuron(details: unknown): details is EaCToolNeuron {
  const x = details as EaCToolNeuron;

  return (
    isEaCNeuron("Tool", x) &&
    x.ToolLookup !== undefined &&
    typeof x.ToolLookup === "string"
  );
}
