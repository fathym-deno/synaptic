import { EaCDetails } from "../../src.deps.ts";
import {
  EaCRetrieverDetails,
  isEaCRetrieverDetails,
} from "./EaCRetrieverDetails.ts";

export type EaCRetrieverAsCode = EaCDetails<EaCRetrieverDetails>;

export function isEaCRetrieverAsCode(eac: unknown): eac is EaCRetrieverAsCode {
  const x = eac as EaCRetrieverAsCode;

  return x && isEaCRetrieverDetails(x.Details);
}
