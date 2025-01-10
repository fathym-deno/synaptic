import { EaCNeuron, isEaCNeuron } from "../../synaptic/EaCNeuron.ts";

export type EaCToolExecutorNeuron = {
  MessagesPath?: string;

  ToolLookups: string[];

  ToolsAsFunctions?: boolean;
} & EaCNeuron<"ToolExecutor">;

export function isEaCToolExecutorNeuron(
  details: unknown,
): details is EaCToolExecutorNeuron {
  const x = details as EaCToolExecutorNeuron;

  return (
    isEaCNeuron("ToolExecutor", x) &&
    x.ToolLookups !== undefined &&
    Array.isArray(x.ToolLookups)
  );
}
