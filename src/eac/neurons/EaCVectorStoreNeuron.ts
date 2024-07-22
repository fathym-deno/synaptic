import { EaCNeuron, isEaCNeuron } from '../EaCNeuron.ts';

export type EaCVectorStoreNeuron = {
  VectorStoreLookup: string;
} & EaCNeuron<'VectorStore'>;

export function isEaCVectorStoreNeuron(
  details: unknown
): details is EaCVectorStoreNeuron {
  const x = details as EaCVectorStoreNeuron;

  return (
    isEaCNeuron('VectorStore', x) &&
    x.VectorStoreLookup !== undefined &&
    typeof x.VectorStoreLookup === 'string'
  );
}
