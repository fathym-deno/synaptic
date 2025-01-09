import { EaCDetails } from "../../src.deps.ts";
import {
  EaCDocumentLoaderDetails,
  isEaCDocumentLoaderDetails,
} from "../loaders/EaCDocumentLoaderDetails.ts";

export type EaCDocumentLoaderAsCode = EaCDetails<EaCDocumentLoaderDetails>;

export function isEaCDocumentLoaderAsCode(
  eac: unknown,
): eac is EaCDocumentLoaderAsCode {
  const vs = eac as EaCDocumentLoaderAsCode;

  return vs && isEaCDocumentLoaderDetails(undefined, vs.Details);
}
