import "https://deno.land/std@0.220.1/dotenv/load.ts";

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
export { BaseListChatMessageHistory } from "npm:@langchain/core@0.2.19/chat_history";
export { BaseDocumentLoader } from "npm:@langchain/core@0.2.19/document_loaders/base";
export { Embeddings } from "npm:@langchain/core@0.2.19/embeddings";
export {
  index,
  type ListKeyOptions,
  RecordManager,
  type RecordManagerInterface,
  type UpdateOptions,
  UUIDV5_NAMESPACE,
} from "npm:@langchain/core@0.2.19/indexing";
export {
  BaseLanguageModel,
  type LanguageModelLike,
} from "npm:@langchain/core@0.2.19/language_models/base";
export { CallbackManagerForToolRun } from "npm:@langchain/core@0.2.19/callbacks/manager";
export { type ToolDefinition } from "npm:@langchain/core@0.2.19/language_models/base";
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
} from "npm:@langchain/core@0.2.19/messages";
export { StringOutputParser } from "npm:@langchain/core@0.2.19/output_parsers";
export {
  type BaseMessagePromptTemplateLike,
  BasePromptTemplate,
  ChatPromptTemplate,
  PromptTemplate,
} from "npm:@langchain/core@0.2.19/prompts";
export {
  Runnable,
  type RunnableConfig,
  type RunnableInterface,
  RunnableLambda,
  type RunnableLike,
  RunnableMap,
  RunnablePassthrough,
  RunnableWithMessageHistory,
} from "npm:@langchain/core@0.2.19/runnables";
export { RemoteRunnable } from "npm:@langchain/core@0.2.19/runnables/remote";
export {
  DynamicStructuredTool,
  DynamicTool,
  StructuredTool,
  type StructuredToolInterface,
  Tool,
} from "npm:@langchain/core@0.2.19/tools";
export {
  convertToOpenAIFunction,
  convertToOpenAITool,
} from "npm:@langchain/core@0.2.19/utils/function_calling";
export { VectorStore } from "npm:@langchain/core@0.2.19/vectorstores";
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
