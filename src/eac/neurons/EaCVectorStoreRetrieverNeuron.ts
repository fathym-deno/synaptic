import { EaCNeuron, isEaCNeuron } from '../EaCNeuron.ts';

export type EaCVectorStoreRetrieverNeuron = {
  VectorStoreLookup: string;
} & EaCNeuron<'VectorStoreRetriever'>;

export function isEaCVectorStoreRetrieverNeuron(
  details: unknown
): details is EaCVectorStoreRetrieverNeuron {
  const x = details as EaCVectorStoreRetrieverNeuron;

  return (
    isEaCNeuron('VectorStoreRetriever', x) &&
    x.VectorStoreLookup !== undefined &&
    typeof x.VectorStoreLookup === 'string'
  );
}
