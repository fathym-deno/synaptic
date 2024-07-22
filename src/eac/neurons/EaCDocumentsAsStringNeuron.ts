import { EaCNeuron, isEaCNeuron } from '../EaCNeuron.ts';

export type EaCDocumentsAsStringNeuron = EaCNeuron<'DocumentsAsString'>;

export function isEaCDocumentsAsStringNeuron(
  details: unknown
): details is EaCDocumentsAsStringNeuron {
  const x = details as EaCDocumentsAsStringNeuron;

  return isEaCNeuron('DocumentsAsString', x);
}
