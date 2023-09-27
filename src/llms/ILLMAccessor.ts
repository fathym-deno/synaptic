import { ConversationMessage } from "../conversations/ConversationMessage.ts";
import { Personality } from "../personalities/Personality.ts";

export type ChatResponse = string | FunctionToCall | null | undefined;

export type LLMAccessorOptions = {
  Model: string;
};

export type FunctionToCall = {
  arguments: Record<string, unknown>;

  name: string;
};

export interface ILLMAccessor<TOptions> {
  Chat(
    personality: Personality,
    messages: ConversationMessage[],
    options: TOptions,
  ): Promise<ChatResponse>;

  ChatStream(
    personality: Personality,
    messages: ConversationMessage[],
    options?: TOptions,
  ): Promise<AsyncIterable<ChatResponse>>;
}
