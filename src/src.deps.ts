import "https://deno.land/std@0.203.0/dotenv/load.ts";
import { BaseCheckpointSaver } from "npm:@langchain/langgraph";

export { delay } from "https://deno.land/std@0.220.1/async/delay.ts";
export {
  type ServerSentEventMessage,
  ServerSentEventStream,
} from "https://deno.land/std@0.220.1/http/server_sent_event_stream.ts";

export { IoCContainer } from "https://deno.land/x/fathym_ioc@v0.0.10/mod.ts";
export * from "https://deno.land/x/fathym_common@v0.0.185/mod.ts";
// export * from '../../everything-as-code/mod.ts';
export * from "https://deno.land/x/fathym_everything_as_code@v0.0.415/mod.ts";
// export * from "../../eac-runtime/mod.ts";
export * from "https://deno.land/x/fathym_eac_runtime@v0.0.275/mod.ts";

export { z, ZodObject, type ZodRawShape, type ZodType } from "npm:zod";
export { zodToJsonSchema } from "npm:zod-to-json-schema";
export { jsonSchemaToZod } from "npm:json-schema-to-zod";

import jsonpath from "https://cdn.skypack.dev/jsonpath";
export { jsonpath };

export {
  type AzureExtensionsOptions,
  AzureKeyCredential,
  type FunctionDefinition,
  OpenAIClient,
} from "npm:@azure/openai@1.0.0-beta.7";
export {
  createOpenAIFunctionsAgent,
  // createOpenAIToolsAgent,
  // createReactAgent,
  // createStructuredChatAgent,
  // createToolCallingAgent,
  // createXmlAgent,
  Toolkit,
} from "npm:langchain/agents";
// export { AzureChatOpenAI } from 'npm:@langchain/openai';
export {
  AzureChatOpenAI,
  AzureOpenAIEmbeddings,
  type OpenAIBaseInput,
} from "npm:@langchain/azure-openai";
import {} from "npm:@langchain/openai";
export { createStuffDocumentsChain } from "npm:langchain/chains/combine_documents";
export { CheerioWebBaseLoader } from "npm:@langchain/community/document_loaders/web/cheerio";
export { WatsonxAI } from "npm:@langchain/community/llms/watsonx_ai";
export {
  AzureAISearchQueryType,
  AzureAISearchVectorStore,
} from "npm:@langchain/community/vectorstores/azure_aisearch";
export { SerpAPI } from "npm:@langchain/community/tools/serpapi";
export { TavilySearchResults } from "npm:@langchain/community/tools/tavily_search";
export { HNSWLib } from "npm:@langchain/community/vectorstores/hnswlib";
export { BaseListChatMessageHistory } from "npm:@langchain/core/chat_history";
export { BaseDocumentLoader } from "npm:@langchain/core/document_loaders/base";
export { Embeddings } from "npm:@langchain/core/embeddings";
export {
  index,
  type ListKeyOptions,
  RecordManager,
  type RecordManagerInterface,
  type UpdateOptions,
  UUIDV5_NAMESPACE,
} from "npm:@langchain/core/indexing";
export {
  BaseLanguageModel,
  type LanguageModelLike,
} from "npm:@langchain/core/language_models/base";
export { CallbackManagerForToolRun } from "npm:@langchain/core/callbacks/manager";
export { type ToolDefinition } from "npm:@langchain/core/language_models/base";
export {
  BaseMessage,
  FunctionMessage,
  mapChatMessagesToStoredMessages,
  mapStoredMessagesToChatMessages,
  type StoredMessage,
  ToolMessage,
} from "npm:@langchain/core/messages";
export { StringOutputParser } from "npm:@langchain/core/output_parsers";
export {
  type BaseMessagePromptTemplateLike,
  BasePromptTemplate,
  ChatPromptTemplate,
  PromptTemplate,
} from "npm:@langchain/core/prompts";
export {
  Runnable,
  type RunnableConfig,
  type RunnableInterface,
  RunnableLambda,
  type RunnableLike,
  RunnableMap,
  RunnablePassthrough,
  RunnableWithMessageHistory,
} from "npm:@langchain/core/runnables";
export { RemoteRunnable } from "npm:@langchain/core/runnables/remote";
export {
  DynamicStructuredTool,
  DynamicTool,
  StructuredTool,
  type StructuredToolInterface,
  Tool,
} from "npm:@langchain/core/tools";
export {
  convertToOpenAIFunction,
  convertToOpenAITool,
} from "npm:@langchain/core/utils/function_calling";
export { VectorStore } from "npm:@langchain/core/vectorstores";
export { pull } from "npm:langchain/hub";
export * from "npm:@langchain/langgraph";
export {
  ToolExecutor,
  type ToolInvocationInterface,
  ToolNode,
} from "npm:@langchain/langgraph/prebuilt";
export {
  RecursiveCharacterTextSplitter,
  TextSplitter,
} from "npm:langchain/text_splitter";
export { MemoryVectorStore } from "npm:langchain/vectorstores/memory";

type ExampleConstructorParams = ConstructorParameters<
  typeof BaseCheckpointSaver
>;

export type SerializerProtocolOrUndefined = ExampleConstructorParams[0];

export type SerializerProtocol = Exclude<
  SerializerProtocolOrUndefined,
  undefined
>;

type GetTupleReturnType = ReturnType<BaseCheckpointSaver["getTuple"]>;

type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type CheckpointTupleOrUndefined = UnwrapPromise<GetTupleReturnType>;

export type CheckpointTuple = Exclude<CheckpointTupleOrUndefined, undefined>;
