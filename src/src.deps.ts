import "jsr:@std/dotenv@0.225.0/load";
import "npm:cheerio@1.0.0";

export { delay } from "jsr:@std/async@1.0.3/delay";
export {
  type ServerSentEventMessage,
  ServerSentEventStream,
} from "jsr:@std/http@1.0.2/server-sent-event-stream";

export { Buffer, toReadableStream } from "jsr:@std/io@0.224.4";

export * from "jsr:@fathym/common@0.0.211";
// export * from '../../everything-as-code/mod.ts';
export * from "jsr:@fathym/eac@0.0.434";
// export * from "../../eac-runtime/mod.ts";
export * from "jsr:@fathym/eac-runtime@0.0.326";
export { IoCContainer } from "jsr:@fathym/ioc@0.0.12";

export { z, ZodObject, type ZodRawShape, type ZodType } from "npm:zod@3.23.8";
export { zodToJsonSchema } from "npm:zod-to-json-schema@3.23.2";
export { jsonSchemaToZod } from "npm:json-schema-to-zod@2.4.0";

import jsonpath from "npm:jsonpath@1.1.1";
export { jsonpath };

// export {
//   type AzureExtensionsOptions,
//   AzureKeyCredential,
//   type FunctionDefinition,
//   OpenAIClient,
// } from 'npm:@azure/openai@2.0.0-beta.1';
export {
  createOpenAIFunctionsAgent,
  // createOpenAIToolsAgent,
  // createReactAgent,
  // createStructuredChatAgent,
  // createToolCallingAgent,
  // createXmlAgent,
  Toolkit,
} from "npm:langchain@0.2.12/agents";
// export { AzureChatOpenAI } from 'npm:@langchain/openai@0.2.5';
import {} from "npm:@langchain/openai@0.2.5";
import { BaseCheckpointSaver } from "npm:@langchain/langgraph@0.0.31";
export {
  AzureChatOpenAI,
  AzureOpenAIEmbeddings,
  type OpenAIBaseInput,
} from "npm:@langchain/azure-openai@0.0.11";
export { createStuffDocumentsChain } from "npm:langchain@0.2.12/chains/combine_documents";
export { CheerioWebBaseLoader } from "npm:@langchain/community@0.2.22/document_loaders/web/cheerio";
export { HtmlToTextTransformer } from "npm:@langchain/community@0.2.22/document_transformers/html_to_text";
export { WatsonxAI } from "npm:@langchain/community@0.2.22/llms/watsonx_ai";
export {
  AzureAISearchQueryType,
  AzureAISearchVectorStore,
} from "npm:@langchain/community@0.2.22/vectorstores/azure_aisearch";
export { SerpAPI } from "npm:@langchain/community@0.2.22/tools/serpapi";
export { TavilySearchResults } from "npm:@langchain/community@0.2.22/tools/tavily_search";
export { HNSWLib } from "npm:@langchain/community@0.2.22/vectorstores/hnswlib";
export { BaseListChatMessageHistory } from "npm:@langchain/core@0.2.23/chat_history";
export { BaseDocumentLoader } from "npm:@langchain/core@0.2.23/document_loaders/base";
export { Embeddings } from "npm:@langchain/core@0.2.23/embeddings";
export {
  index,
  type ListKeyOptions,
  RecordManager,
  type RecordManagerInterface,
  type UpdateOptions,
  UUIDV5_NAMESPACE,
} from "npm:@langchain/core@0.2.23/indexing";
export {
  BaseLanguageModel,
  type LanguageModelLike,
} from "npm:@langchain/core@0.2.23/language_models/base";
export { CallbackManagerForToolRun } from "npm:@langchain/core@0.2.23/callbacks/manager";
export { type ToolDefinition } from "npm:@langchain/core@0.2.23/language_models/base";
export {
  AIMessage,
  AIMessageChunk,
  BaseMessage,
  FunctionMessage,
  HumanMessage,
  HumanMessageChunk,
  mapChatMessagesToStoredMessages,
  mapStoredMessagesToChatMessages,
  type StoredMessage,
  ToolMessage,
} from "npm:@langchain/core@0.2.23/messages";
export { StringOutputParser } from "npm:@langchain/core@0.2.23/output_parsers";
export {
  type BaseMessagePromptTemplateLike,
  BasePromptTemplate,
  ChatPromptTemplate,
  PromptTemplate,
} from "npm:@langchain/core@0.2.23/prompts";
export {
  Runnable,
  type RunnableConfig,
  type RunnableInterface,
  RunnableLambda,
  type RunnableLike,
  RunnableMap,
  RunnablePassthrough,
  RunnableWithMessageHistory,
} from "npm:@langchain/core@0.2.23/runnables";
export { RemoteRunnable } from "npm:@langchain/core@0.2.23/runnables/remote";
export {
  DynamicStructuredTool,
  DynamicTool,
  StructuredTool,
  type StructuredToolInterface,
  Tool,
} from "npm:@langchain/core@0.2.23/tools";
export {
  convertToOpenAIFunction,
  convertToOpenAITool,
} from "npm:@langchain/core@0.2.23/utils/function_calling";
export { VectorStore } from "npm:@langchain/core@0.2.23/vectorstores";
export { pull } from "npm:langchain@0.2.12/hub";
export * from "npm:@langchain/langgraph@0.0.31";
export {
  ToolExecutor,
  type ToolInvocationInterface,
  ToolNode,
} from "npm:@langchain/langgraph@0.0.31/prebuilt";
export {
  RecursiveCharacterTextSplitter,
  type SupportedTextSplitterLanguage,
  TextSplitter,
} from "npm:@langchain/textsplitters@0.0.3";
export { formatDocumentsAsString } from "npm:langchain@0.2.12/util/document";
export { MemoryVectorStore } from "npm:langchain@0.2.12/vectorstores/memory";

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
