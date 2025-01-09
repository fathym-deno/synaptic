import { EaCDetails } from "../src.deps.ts";
import { EaCAIDetails, isEaCAIDetails } from "./EaCAIDetails.ts";
import { EaCChatHistoryAsCode } from "./history/EaCChatHistoryAsCode.ts";
import { EaCDocumentLoaderAsCode } from "./loaders/EaCDocumentLoaderAsCode.ts";
import { EaCEmbeddingsAsCode } from "./embeddings/EaCEmbeddingsAsCode.ts";
import { EaCIndexerAsCode } from "./indexers/EaCIndexerAsCode.ts";
import { EaCLLMAsCode } from "./llms/EaCLLMAsCode.ts";
import { EaCPersistenceAsCode } from "./persistence/EaCPersistenceAsCode.ts";
import { EaCPersonalityAsCode } from "./personalities/EaCPersonalityAsCode.ts";
import { EaCRetrieverAsCode } from "./retrievers/EaCRetrieverAsCode.ts";
import { EaCTextSplitterAsCode } from "./text-splitters/EaCTextSplitterAsCode.ts";
import { EaCToolAsCode } from "./tools/EaCToolAsCode.ts";
import { EaCVectorStoreAsCode } from "./vector-stores/EaCVectorStoreAsCode.ts";

export type EaCAIAsCode = {
  ChatHistories?: Record<string, EaCChatHistoryAsCode>;

  Embeddings?: Record<string, EaCEmbeddingsAsCode>;

  Indexers?: Record<string, EaCIndexerAsCode>;

  LLMs?: Record<string, EaCLLMAsCode>;

  Loaders?: Record<string, EaCDocumentLoaderAsCode>;

  Persistence?: Record<string, EaCPersistenceAsCode>;

  Personalities?: Record<string, EaCPersonalityAsCode>;

  Retrievers?: Record<string, EaCRetrieverAsCode>;

  TextSplitters?: Record<string, EaCTextSplitterAsCode>;

  Tools?: Record<string, EaCToolAsCode>;

  VectorStores?: Record<string, EaCVectorStoreAsCode>;
} & EaCDetails<EaCAIDetails>;

export function isEaCAIAsCode(eac: unknown): eac is EaCAIAsCode {
  const ai = eac as EaCAIAsCode;

  return ai && isEaCAIDetails(ai.Details);
}
