import { ConversationMessage } from '../../conversations/ConversationMessage.ts';
import { Personality } from '../../personalities/Personality.ts';
import {
  AzureExtensionsOptions,
  convertAsyncIterable,
  OpenAIClient,
} from '../../src.deps.ts';
import { ILLMAccessor, LLMAccessorOptions } from '../ILLMAccessor.ts';

export type OpenAILLMAccessorOptions = {
  Extensions?: AzureExtensionsOptions;

  Stream?: boolean;
} & LLMAccessorOptions;

export class OpenAILLMAccessor
  implements ILLMAccessor<OpenAILLMAccessorOptions>
{
  constructor(protected openAiClient: OpenAIClient) {}

  public async Chat(
    personality: Personality,
    messages: ConversationMessage[],
    options: OpenAILLMAccessorOptions = {
      Model: 'gpt-35-turbo',
    }
  ): Promise<string | null | undefined> {
    const chatMessages = messages.map((msg) => {
      return {
        role: msg.From,
        content: msg.Content,
      };
    });

    const chatCompletions = await this.openAiClient.getChatCompletions(
      options?.Model!,
      [
        {
          role: 'system',
          content: `${personality.Declarations} ${personality.Instructions}`,
        },
        ...chatMessages,
      ],
      {
        // azureExtensionOptions: options?.Extensions,
        maxTokens: personality.MaxTokens,
        temperature: personality.Temperature,
      }
    );

    return chatCompletions.choices[0]?.message?.content;
  }

  public async ChatStream(
    personality: Personality,
    messages: ConversationMessage[],
    options: OpenAILLMAccessorOptions = {
      Model: 'gpt-35-turbo',
    }
  ): Promise<AsyncIterable<string | null | undefined>> {
    const chatMessages = messages.map((msg) => {
      return {
        role: msg.From,
        content: msg.Content,
      };
    });

    const chatCompletions = await this.openAiClient.listChatCompletions(
      options?.Model!,
      [
        {
          role: 'system',
          content: `${personality.Declarations} ${personality.Instructions}`,
        },
        ...chatMessages,
      ],
      {
        azureExtensionOptions: options?.Extensions,
        maxTokens: personality.MaxTokens,
        temperature: personality.Temperature,
        stream: options?.Stream,
      }
    );

    const iterable = convertAsyncIterable(chatCompletions, (event) => {
      return Promise.resolve(event.choices[0]?.delta?.content);
    });

    return iterable;
  }
}
