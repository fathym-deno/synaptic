import { EaCChatPromptNeuron } from "../../../eac/neurons/EaCChatPromptNeuron.ts";
import { NeuronBuilder } from "./NeuronBuilder.ts";
import { EaCPersonalityDetails } from "../../../eac/EaCPersonalityDetails.ts";

export type ChatPromptNeuronOptions = EaCPersonalityDetails;

export class ChatPromptNeuronBuilder
  extends NeuronBuilder<EaCChatPromptNeuron> {
  constructor(lookup: string, options: ChatPromptNeuronOptions = {}) {
    super(lookup, {
      Type: "ChatPrompt",
      ...options,
    });
  }
}
