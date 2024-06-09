import { EaCNeuron, isEaCNeuron } from "../EaCNeuron.ts";

export type EaCToolNodeNeuron = {
  ToolLookups: string[];
} & EaCNeuron<"ToolNode">;

export function isEaCToolNodeNeuron(
  details: unknown,
): details is EaCToolNodeNeuron {
  const x = details as EaCToolNodeNeuron;

  return (
    isEaCNeuron("ToolNode", x) &&
    x.ToolLookups !== undefined &&
    Array.isArray(x.ToolLookups)
  );
}
