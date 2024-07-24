import { EaCDetails } from "../src.deps.ts";
import {
  EaCPersonalityDetails,
  isEaCPersonalityDetails,
} from "./EaCPersonalityDetails.ts";

export type EaCPersonalityAsCode = {
  Personalities?: string[];
} & EaCDetails<EaCPersonalityDetails>;

export function isEaCPersonalityAsCode(
  eac: unknown,
): eac is EaCPersonalityAsCode {
  const x = eac as EaCPersonalityAsCode;

  return x && isEaCPersonalityDetails(x.Details);
}
