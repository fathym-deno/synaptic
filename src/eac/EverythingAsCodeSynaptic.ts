import { EverythingAsCodeDFS } from "../src.deps.ts";
import { EaCAIAsCode } from "./EaCAIAsCode.ts";
import { EaCCircuitAsCode } from "./EaCCircuitAsCode.ts";
import { EaCNeuron } from "./EaCNeuron.ts";

export type EverythingAsCodeSynaptic = {
  AIs?: Record<string, EaCAIAsCode>;

  Circuits?: Record<string, EaCCircuitAsCode> & {
    $handlers?: Array<string>;
    $neurons?: Record<string, EaCNeuron>;
    $remotes?: Record<string, string>;
  };
} & EverythingAsCodeDFS;

export function isEverythingAsCodeSynaptic(
  eac: unknown,
): eac is EverythingAsCodeSynaptic {
  const synEaC = eac as EverythingAsCodeSynaptic;

  return synEaC && synEaC.AIs !== undefined && synEaC.Circuits !== undefined;
}
