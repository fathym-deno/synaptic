import { ChatCompletions, FunctionCall } from "npm:@azure/openai@next";
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
    const finalMessages = [
      ...(personality.Messages || []),
      ...messages,
      ...(personality.Commands || []),
    ];

    const chatMessages = finalMessages.map((msg) => {
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
        azureExtensionOptions: options?.Extensions,
        maxTokens: personality.MaxTokens,
        temperature: personality.Temperature,
        functionCall: funcCall,
        functions: options?.Functions,
      },
    );

    const funcToCall = chatCompletions.choices[0]?.message?.functionCall
      ? this.toFunctionToCall(chatCompletions.choices[0]?.message?.functionCall)
      : undefined;

    return funcToCall || chatCompletions.choices[0]?.message?.content;
  }

  public async ChatStream(
    personality: Personality,
    messages: ConversationMessage[],
    options: OpenAILLMAccessorOptions = {
      Model: "gpt-35-turbo-16k",
    },
  ): Promise<AsyncIterable<ChatResponse>> {
    const finalMessages = [
      ...(personality.Messages || []),
      ...messages,
      ...(personality.Commands || []),
    ];

    const chatMessages = finalMessages.map((msg) => {
      return {
        role: msg.From,
        content: msg.Content,
      };
    });

    const funcCall = options?.FunctionRequired
      ? { name: options?.Functions![options.FunctionRequired].name }
      : undefined;

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
        functionCall: funcCall,
        functions: options?.Functions,
      },
    );

    const iterable = convertAsyncIterable<ChatCompletions, ChatResponse>(
      chatCompletions,
      (event) => {
        if (event.choices[0]?.delta?.functionCall) {
          return Promise.resolve(
            this.toFunctionToCall(event.choices[0]?.delta?.functionCall),
          );
        } else {
          return Promise.resolve(event.choices[0]?.delta?.content);
        }
      },
    );

    return iterable;
  }

  public async Embedding(
    input: string[],
    model = "text-embedding-ada-002",
    user = "system",
  ): Promise<number[]> {
    const embeddingsResp = await this.openAiClient.getEmbeddings(model, input, {
      user: user,
    });

    const embeddings = new Array(input.length);

    for (const embeddingItem of embeddingsResp.data) {
      embeddings[embeddingItem.index] = embeddingItem.embedding;
    }

    return embeddings;
  }

  protected toFunctionToCall(call: FunctionCall): FunctionToCall {
    console.log(call.arguments);
    return {
      name: call.name,
      arguments: JSON.parse(call.arguments),
    } as FunctionToCall;
  }
}
