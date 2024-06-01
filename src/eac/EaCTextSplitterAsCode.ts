import { EaCDetails } from "../src.deps.ts";
import {
  EaCTextSplitterDetails,
  isEaCTextSplitterDetails,
} from "./EaCTextSplitterDetails.ts";

export type EaCTextSplitterAsCode = EaCDetails<EaCTextSplitterDetails>;

export function isEaCTextSplitterAsCode(
  eac: unknown,
): eac is EaCTextSplitterAsCode {
  const x = eac as EaCTextSplitterAsCode;

  return x && isEaCTextSplitterDetails(undefined, x.Details);
}
