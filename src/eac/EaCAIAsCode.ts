import { EaCDetails } from "../src.deps.ts";
import { EaCAIDetails, isEaCAIDetails } from "./EaCAIDetails.ts";
import { EaCChatHistoryAsCode } from "./EaCChatHistoryAsCode.ts";
import { EaCDocumentLoaderAsCode } from "./EaCDocumentLoaderAsCode.ts";
import { EaCEmbeddingsAsCode } from "./EaCEmbeddingsAsCode.ts";
import { EaCIndexerAsCode } from "./EaCIndexerAsCode.ts";
import { EaCLLMAsCode } from "./EaCLLMAsCode.ts";
import { EaCPersistenceAsCode } from "./EaCPersistenceAsCode.ts";
import { EaCTextSplitterAsCode } from "./EaCTextSplitterAsCode.ts";
import { EaCToolAsCode } from "./EaCToolAsCode.ts";
import { EaCVectorStoreAsCode } from "./EaCVectorStoreAsCode.ts";

export type EaCAIAsCode = {
  ChatHistories?: Record<string, EaCChatHistoryAsCode>;

  Embeddings?: Record<string, EaCEmbeddingsAsCode>;

  Indexers?: Record<string, EaCIndexerAsCode>;

  LLMs?: Record<string, EaCLLMAsCode>;

  Loaders?: Record<string, EaCDocumentLoaderAsCode>;

  Persistence?: Record<string, EaCPersistenceAsCode>;

  TextSplitters?: Record<string, EaCTextSplitterAsCode>;

  Tools?: Record<string, EaCToolAsCode>;

  VectorStores?: Record<string, EaCVectorStoreAsCode>;
} & EaCDetails<EaCAIDetails>;

export function isEaCAIAsCode(eac: unknown): eac is EaCAIAsCode {
  const ai = eac as EaCAIAsCode;

  return ai && isEaCAIDetails(ai.Details);
}
