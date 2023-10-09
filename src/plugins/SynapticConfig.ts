import { IConversationState } from "../conversations/IConversationState.ts";
import { OpenAILLMAccessor } from "../llms/openai/OpenAILLMAccessor.ts";
import { IPersonalityProvider } from "../personalities/IPersonalityProvider.ts";
import { PersonalityKey } from "../personalities/PersonalityKey.ts";

export type SynapticConversationsAPIConfig = {
  ChatPersonalityKey: PersonalityKey;

  Root?: string;
};

export type SynapticConfig = {
  APIRoot?: string;

  Conversations: SynapticConversationsAPIConfig;

  ConvoState: IConversationState;

  LLM: OpenAILLMAccessor;

  Personalities: IPersonalityProvider;
};
