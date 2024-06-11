import { EaCDetails } from '../src.deps.ts';
import {
  EaCPersistenceDetails,
  isEaCPersistenceDetails,
} from './EaCPersistenceDetails.ts';

export type EaCPersistenceAsCode = EaCDetails<EaCPersistenceDetails>;

export function isEaCPersistenceAsCode(
  eac: unknown
): eac is EaCPersistenceAsCode {
  const x = eac as EaCPersistenceAsCode;

  return x && isEaCPersistenceDetails(undefined, x.Details);
}
