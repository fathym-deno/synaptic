import { BaseMessage, BaseMessagePromptTemplateLike } from '../../src.deps.ts';
import { EaCNeuron, isEaCNeuron } from '../EaCNeuron.ts';

export type EaCChatPromptNeuron = {
  Messages?: BaseMessage[];

  NewMessages?: BaseMessagePromptTemplateLike[];

  SystemMessage?: string;
} & EaCNeuron<'ChatPrompt'>;

export function isEaCChatPromptNeuron(
  details: unknown
): details is EaCChatPromptNeuron {
  const x = details as EaCChatPromptNeuron;

  return isEaCNeuron('ChatPrompt', x);
}
