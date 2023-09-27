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

export async function* convertAsyncIterable<T, R>(
  source: AsyncIterable<T>,
  converter: (item: T) => Promise<R>,
): AsyncIterable<R> {
  for await (const item of source) {
    const convertedItem = await converter(item);

    yield convertedItem;
  }
}
