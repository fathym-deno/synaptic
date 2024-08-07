import { EaCDetails } from "../src.deps.ts";
import { EaCCircuitDetails, isEaCCircuitDetails } from "./EaCCircuitDetails.ts";

export type EaCCircuitAsCode = {
  Circuits?: Record<string, EaCCircuitAsCode | null>;
} & EaCDetails<EaCCircuitDetails>;

export function isEaCCircuitAsCode(eac: unknown): eac is EaCCircuitAsCode {
  const x = eac as EaCCircuitAsCode;

  return x && isEaCCircuitDetails(undefined, x.Details);
}
