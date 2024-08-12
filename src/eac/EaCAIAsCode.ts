import { EaCDetails } from "../src.deps.ts";
import { EaCAIDetails, isEaCAIDetails } from "./EaCAIDetails.ts";
import { EaCChatHistoryAsCode } from "./EaCChatHistoryAsCode.ts";
import { EaCDocumentLoaderAsCode } from "./EaCDocumentLoaderAsCode.ts";
import { EaCEmbeddingsAsCode } from "./EaCEmbeddingsAsCode.ts";
import { EaCIndexerAsCode } from "./EaCIndexerAsCode.ts";
import { EaCLLMAsCode } from "./EaCLLMAsCode.ts";
import { EaCPersistenceAsCode } from "./EaCPersistenceAsCode.ts";
import { EaCPersonalityAsCode } from "./EaCPersonalityAsCode.ts";
import { EaCRetrieverAsCode } from "./EaCRetrieverAsCode.ts";
import { EaCTextSplitterAsCode } from "./EaCTextSplitterAsCode.ts";
import { EaCToolAsCode } from "./EaCToolAsCode.ts";
import { EaCVectorStoreAsCode } from "./EaCVectorStoreAsCode.ts";

export type EaCAIAsCode = {
  ChatHistories?: Record<string, EaCChatHistoryAsCode | null>;

  Embeddings?: Record<string, EaCEmbeddingsAsCode | null>;

  Indexers?: Record<string, EaCIndexerAsCode | null>;

  LLMs?: Record<string, EaCLLMAsCode | null>;

  Loaders?: Record<string, EaCDocumentLoaderAsCode | null>;

  Persistence?: Record<string, EaCPersistenceAsCode | null>;

  Personalities?: Record<string, EaCPersonalityAsCode | null>;

  Retrievers?: Record<string, EaCRetrieverAsCode | null>;

  TextSplitters?: Record<string, EaCTextSplitterAsCode | null>;

  Tools?: Record<string, EaCToolAsCode | null>;

  VectorStores?: Record<string, EaCVectorStoreAsCode | null>;
} & EaCDetails<EaCAIDetails>;

export function isEaCAIAsCode(eac: unknown): eac is EaCAIAsCode {
  const ai = eac as EaCAIAsCode;

  return ai && isEaCAIDetails(ai.Details);
}
