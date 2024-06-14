import { EaCMetadataBase } from "../src.deps.ts";
import { EaCAIAsCode } from "./EaCAIAsCode.ts";
import { EaCCircuitAsCode } from "./EaCCircuitAsCode.ts";
import { EaCNeuron } from "./EaCNeuron.ts";
import { EaCRetrieverAsCode } from "./EaCRetrieverAsCode.ts";

export type EverythingAsCodeSynaptic = {
  AIs?: Record<string, EaCAIAsCode>;

  Circuits?: { $neurons?: Record<string, EaCNeuron> } & {
    $remotes?: Record<string, string>;
  } & Record<string, EaCCircuitAsCode>;

  Retrievers?: Record<string, EaCRetrieverAsCode>;
} & EaCMetadataBase;

export function isEverythingAsCodeSynaptic(
  eac: unknown,
): eac is EverythingAsCodeSynaptic {
  const synEaC = eac as EverythingAsCodeSynaptic;

  return synEaC && synEaC.AIs !== undefined && synEaC.Circuits !== undefined;
}
