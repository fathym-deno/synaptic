import {
  EverythingAsCode,
  EverythingAsCodeDatabases,
  EverythingAsCodeDFS,
} from "../src.deps.ts";
import { EaCAIAsCode } from "./EaCAIAsCode.ts";
import { EaCCircuitAsCode } from "./EaCCircuitAsCode.ts";
import { EaCNeuronLike } from "./EaCNeuron.ts";

export type EverythingAsCodeSynaptic = {
  AIs?: Record<string, EaCAIAsCode>;

  /**
   * The circuits.
   */
  Circuits?: {
    $handlers?: Array<string>;
    $neurons?: Record<string, EaCNeuronLike>;
    $remotes?: Record<string, string>;
  } & Record<string, EaCCircuitAsCode>;
} & EverythingAsCode &
  EverythingAsCodeDatabases &
  EverythingAsCodeDFS;

export function isEverythingAsCodeSynaptic(
  eac: unknown,
): eac is EverythingAsCodeSynaptic {
  const synEaC = eac as EverythingAsCodeSynaptic;

  return synEaC && synEaC.AIs !== undefined && synEaC.Circuits !== undefined;
}
