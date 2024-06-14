import { EaCVertexDetails } from "../src.deps.ts";

export type EaCAIDetails = EaCVertexDetails;

export function isEaCAIDetails(details: unknown): details is EaCAIDetails {
  const aiDetails = details as EaCAIDetails;

  return !!aiDetails;
}
