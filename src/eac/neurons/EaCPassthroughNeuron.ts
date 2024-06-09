import { EaCNeuron, isEaCNeuron } from '../EaCNeuron.ts';

export type EaCPassthroughNeuron = {
  Field?: string;
} & EaCNeuron<'Passthrough'>;

export function isEaCPassthroughNeuron(
  details: unknown
): details is EaCPassthroughNeuron {
  const x = details as EaCPassthroughNeuron;

  return isEaCNeuron('Passthrough', x);
}
