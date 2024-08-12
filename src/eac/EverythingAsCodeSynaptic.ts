import { EverythingAsCodeDFS } from "../src.deps.ts";
import { EaCAIAsCode } from "./EaCAIAsCode.ts";
import { EaCCircuitAsCode } from "./EaCCircuitAsCode.ts";
import { EaCNeuronLike } from "./EaCNeuron.ts";

export type EverythingAsCodeSynaptic = {
  AIs?: Record<string, EaCAIAsCode>;

  Circuits?: Record<string, EaCCircuitAsCode> & {
    $handlers?: Array<string> | null;
    $neurons?: Record<string, EaCNeuronLike | null>;
    $remotes?: Record<string, string | null>;
  };
} & EverythingAsCodeDFS;

export function isEverythingAsCodeSynaptic(
  eac: unknown,
): eac is EverythingAsCodeSynaptic {
  const synEaC = eac as EverythingAsCodeSynaptic;

  return synEaC && synEaC.AIs !== undefined && synEaC.Circuits !== undefined;
}
