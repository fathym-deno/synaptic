import { EaCNeuron, isEaCNeuron } from '../EaCNeuron.ts';

export type EaCLLMNeuron = {
  LLMLookup: string;
} & EaCNeuron<'LLM'>;

export function isEaCLLMNeuron(details: unknown): details is EaCLLMNeuron {
  const x = details as EaCLLMNeuron;

  return (
    isEaCNeuron('LLM', x) &&
    x.LLMLookup !== undefined &&
    typeof x.LLMLookup === 'string'
  );
}
