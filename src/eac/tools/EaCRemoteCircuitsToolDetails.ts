import { EaCToolDetails, isEaCToolDetails } from "../EaCToolDetails.ts";

export type EaCRemoteCircuitsToolDetails = {
  URL: string;
} & EaCToolDetails<"RemoteCircuits">;

export function isEaCRemoteCircuitsToolDetails(
  details: unknown,
): details is EaCRemoteCircuitsToolDetails {
  const x = details as EaCRemoteCircuitsToolDetails;

  return (
    isEaCToolDetails("RemoteCircuits", x) &&
    x.CircuitLookup !== undefined &&
    typeof x.CircuitLookup === "string"
  );
}
