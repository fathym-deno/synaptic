import { EaCVertexDetails } from '../src.deps.ts';

export type EaCEmbeddingsDetails<TType = unknown> = {
  APIKey: string;

  APIVersion?: string;

  Instance: string;

  Type: TType;
} & EaCVertexDetails;

export function isEaCEmbeddingsDetails<TType = unknown>(
  type: TType,
  details: unknown
): details is EaCEmbeddingsDetails {
  const x = details as EaCEmbeddingsDetails;

  return (
    x &&
    (!type || x.Type === type) &&
    x.APIKey !== undefined &&
    typeof x.APIKey === 'string' &&
    x.Instance !== undefined &&
    typeof x.Instance === 'string'
  );
}
