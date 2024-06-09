import { EaCNeuron, isEaCNeuron } from '../EaCNeuron.ts';

export type EaCCircuitNeuron = {
  CircuitLookup: string;
} & EaCNeuron<'Circuit'>;

export function isEaCCircuitNeuron(
  details: unknown
): details is EaCCircuitNeuron {
  const x = details as EaCCircuitNeuron;

  return (
    isEaCNeuron('Circuit', x) &&
    x.CircuitLookup !== undefined &&
    typeof x.CircuitLookup === 'string'
  );
}
