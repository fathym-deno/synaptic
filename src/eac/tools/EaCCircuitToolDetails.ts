import { EaCToolDetails, isEaCToolDetails } from "./EaCToolDetails.ts";

export type EaCCircuitToolDetails = {
  CircuitLookup: string;
} & EaCToolDetails<"Circuit">;

export function isEaCCircuitToolDetails(
  details: unknown,
): details is EaCCircuitToolDetails {
  const x = details as EaCCircuitToolDetails;

  return (
    isEaCToolDetails("Circuit", x) &&
    x.CircuitLookup !== undefined &&
    typeof x.CircuitLookup === "string"
  );
}
