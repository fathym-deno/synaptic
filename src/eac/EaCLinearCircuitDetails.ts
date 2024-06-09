import { EaCCircuitDetails, isEaCCircuitDetails } from "./EaCCircuitDetails.ts";

export type EaCLinearCircuitDetails = EaCCircuitDetails<"Linear">;

export function isEaCLinearCircuitDetails(
  details: unknown,
): details is EaCLinearCircuitDetails {
  const x = details as EaCLinearCircuitDetails;

  return isEaCCircuitDetails("Linear", x);
}
