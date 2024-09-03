import { EaCVertexDetails } from '../src.deps.ts';

export type EaCPersistenceDetails<TType = unknown> = {
  Type: TType;
} & EaCVertexDetails;

export function isEaCPersistenceDetails<TType = unknown>(
  type: TType,
  details: unknown
): details is EaCPersistenceDetails {
  const x = details as EaCPersistenceDetails;

  return x && (!type || x.Type === type);
}
