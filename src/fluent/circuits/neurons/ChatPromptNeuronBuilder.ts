import { BaseMessagePromptTemplateLike } from "../../../src.deps.ts";
import { EaCChatPromptNeuron } from "../../../eac/neurons/EaCChatPromptNeuron.ts";
import { PersonalityId } from "../../resources/PersonalityBuilder.ts";
import { NeuronBuilder } from "./NeuronBuilder.ts";

export type ChatPromptNeuronOptions = {
  instructions?: string[];
  messages?: BaseMessagePromptTemplateLike[];
  newMessages?: BaseMessagePromptTemplateLike[];
  personality?: PersonalityId;
  systemMessage?: string;
};

export class ChatPromptNeuronBuilder
  extends NeuronBuilder<EaCChatPromptNeuron> {
  constructor(lookup: string, options: ChatPromptNeuronOptions = {}) {
    super(lookup, {
      Type: "ChatPrompt",
      Instructions: options.instructions,
      Messages: options.messages,
      NewMessages: options.newMessages,
      PersonalityLookup: options.personality,
      SystemMessage: options.systemMessage,
    });
  }
}
