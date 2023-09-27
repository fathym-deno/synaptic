import { ConversationMessage } from "../../conversations/ConversationMessage.ts";
import { Personality } from "../../personalities/Personality.ts";
import {
  AzureExtensionsOptions,
  convertAsyncIterable,
  FunctionDefinition,
  OpenAIClient,
} from "../../src.deps.ts";
import {
  ChatResponse,
  FunctionToCall,
  ILLMAccessor,
  LLMAccessorOptions,
} from "../ILLMAccessor.ts";

export type OpenAILLMAccessorOptions = {
  Extensions?: AzureExtensionsOptions;

  Functions?: FunctionDefinition[];

  FunctionRequired?: number;

  Stream?: boolean;
} & LLMAccessorOptions;

export class OpenAILLMAccessor
  implements ILLMAccessor<OpenAILLMAccessorOptions> {
  constructor(protected openAiClient: OpenAIClient) {}

  public async Chat(
    personality: Personality,
    messages: ConversationMessage[],
    options: OpenAILLMAccessorOptions = {
      Model: "gpt-35-turbo-16k",
    },
  ): Promise<ChatResponse> {
    const chatMessages = messages.map((msg) => {
      return {
        role: msg.From,
        content: msg.Content,
      };
    });

    const funcCall = options?.FunctionRequired
      ? options?.Functions![options.FunctionRequired].name
      : undefined;

    const chatCompletions = await this.openAiClient.getChatCompletions(
      options?.Model!,
      [
        {
          role: "system",
          content: `${personality.Declarations} ${personality.Instructions}`,
        },
        ...chatMessages,
      ],
      {
        // azureExtensionOptions: options?.Extensions,
        maxTokens: personality.MaxTokens,
        temperature: personality.Temperature,
        functionCall: funcCall,
        functions: options?.Functions,
      },
    );

    const funcToCall = chatCompletions.choices[0]?.message?.functionCall
      ? {
        name: chatCompletions.choices[0]?.message?.functionCall.name,
        arguments: JSON.parse(
          chatCompletions.choices[0]?.message?.functionCall.arguments,
        ) as FunctionToCall,
      }
      : undefined;

    return funcToCall || chatCompletions.choices[0]?.message?.content;
  }

  public async ChatStream(
    personality: Personality,
    messages: ConversationMessage[],
    options: OpenAILLMAccessorOptions = {
      Model: "gpt-35-turbo",
    },
  ): Promise<AsyncIterable<ChatResponse>> {
    const chatMessages = messages.map((msg) => {
      return {
        role: msg.From,
        content: msg.Content,
      };
    });

    // TODO: Support through streaming
    // const funcCall = options?.FunctionRequired
    //   ? options?.Functions![options.FunctionRequired].name
    //   : undefined;

    const chatCompletions = await this.openAiClient.listChatCompletions(
      options?.Model!,
      [
        {
          role: "system",
          content: `${personality.Declarations} ${personality.Instructions}`,
        },
        ...chatMessages,
      ],
      {
        azureExtensionOptions: options?.Extensions,
        maxTokens: personality.MaxTokens,
        temperature: personality.Temperature,
        stream: options?.Stream,
        // functionCall: funcCall,
        // functions: options?.Functions,
      },
    );

    const iterable = convertAsyncIterable(chatCompletions, (event) => {
      return Promise.resolve(event.choices[0]?.delta?.content);
    });

    return iterable;
  }
}
