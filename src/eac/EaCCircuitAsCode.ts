// deno-lint-ignore-file no-explicit-any ban-types
import { EaCDetails } from "../src.deps.ts";
import { EaCCircuitDetails, isEaCCircuitDetails } from "./EaCCircuitDetails.ts";

export type EaCCircuitAsCode = {
  // Circuits?: Record<string, EaCCircuitAsCode>;
} & EaCDetails<EaCCircuitDetails<any>>;

export function isEaCCircuitAsCode(eac: unknown): eac is EaCCircuitAsCode {
  const x = eac as EaCCircuitAsCode;

  return x && isEaCCircuitDetails(undefined, x.Details);
}
