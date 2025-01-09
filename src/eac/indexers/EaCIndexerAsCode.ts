import { EaCDetails } from "../../src.deps.ts";
import {
  EaCIndexerDetails,
  isEaCIndexerDetails,
} from "../indexers/EaCIndexerDetails.ts";

export type EaCIndexerAsCode = EaCDetails<EaCIndexerDetails>;

export function isEaCIndexerAsCode(eac: unknown): eac is EaCIndexerAsCode {
  const x = eac as EaCIndexerAsCode;

  return x && isEaCIndexerDetails(undefined, x.Details);
}
