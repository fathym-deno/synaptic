import { EaCDetails } from '../src.deps.ts';
import { EaCToolDetails, isEaCToolDetails } from './EaCToolDetails.ts';

export type EaCToolAsCode = EaCDetails<EaCToolDetails>;

export function isEaCToolAsCode(eac: unknown): eac is EaCToolAsCode {
  const x = eac as EaCToolAsCode;

  return x && isEaCToolDetails(undefined, x.Details);
}
