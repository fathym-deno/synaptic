import { ConversationMessage } from "../conversations/ConversationMessage.ts";
import { Personality } from "../personalities/Personality.ts";

export type LLMAccessorOptions = {
  Model: string;
};

export interface ILLMAccessor<TOptions> {
  ChatStream(
    personality: Personality,
    messages: ConversationMessage[],
    options?: TOptions,
  ): Promise<AsyncIterable<string | null | undefined>>;
}
