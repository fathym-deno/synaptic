import { EaCNeuron, isEaCNeuron } from '../EaCNeuron.ts';
import { EaCPersonalityDetails } from '../EaCPersonalityDetails.ts';

export type EaCChatPromptNeuron = {
  PersonalityLookup?: string;
} & EaCPersonalityDetails &
  EaCNeuron<'ChatPrompt'>;

export function isEaCChatPromptNeuron(
  details: unknown
): details is EaCChatPromptNeuron {
  const x = details as EaCChatPromptNeuron;

  return isEaCNeuron('ChatPrompt', x);
}
