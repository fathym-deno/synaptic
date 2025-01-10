import {
  EverythingAsCode,
  EverythingAsCodeDenoKV,
  EverythingAsCodeDFS,
} from "../src.deps.ts";
import { EaCAIAsCode } from "../eac/EaCAIAsCode.ts";
import { EaCCircuitAsCode } from "../eac/EaCCircuitAsCode.ts";
import { EaCNeuronLike } from "./EaCNeuron.ts";

export type EverythingAsCodeSynaptic =
  & {
    AIs?: Record<string, EaCAIAsCode>;

    Circuits?: {
      $circuitsDFSLookups?: Array<string>;
      $resolvers?: Array<string>;
      $neurons?: Record<string, EaCNeuronLike>;
      $remotes?: Record<string, string>;
    } & Record<string, EaCCircuitAsCode>;
  }
  & EverythingAsCode
  & EverythingAsCodeDenoKV
  & EverythingAsCodeDFS;

export function isEverythingAsCodeSynaptic(
  eac: unknown,
): eac is EverythingAsCodeSynaptic {
  const synEaC = eac as EverythingAsCodeSynaptic;

  return synEaC && synEaC.AIs !== undefined && synEaC.Circuits !== undefined;
}
