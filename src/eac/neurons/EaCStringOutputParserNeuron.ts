import { EaCNeuron, isEaCNeuron } from '../EaCNeuron.ts';

export type EaCStringOutputParserNeuron = {} & EaCNeuron<'StringOutputParser'>;

export function isEaCStringOutputParserNeuron(
  details: unknown
): details is EaCStringOutputParserNeuron {
  const x = details as EaCStringOutputParserNeuron;

  return isEaCNeuron('StringOutputParser', x);
}
