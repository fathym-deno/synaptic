import { EaCAIAsCode } from "../../eac/EaCAIAsCode.ts";
import { EaCLLMDetails } from "../../eac/llms/EaCLLMDetails.ts";
import { EaCEmbeddingsDetails } from "../../eac/EaCEmbeddingsDetails.ts";
import { EaCIndexerDetails } from "../../eac/EaCIndexerDetails.ts";
import { EaCDocumentLoaderDetails } from "../../eac/EaCDocumentLoaderDetails.ts";
import { EaCPersistenceDetails } from "../../eac/EaCPersistenceDetails.ts";
import { EaCPersonalityDetails } from "../../eac/EaCPersonalityDetails.ts";
import { EaCRetrieverDetails } from "../../eac/EaCRetrieverDetails.ts";
import { EaCTextSplitterDetails } from "../../eac/EaCTextSplitterDetails.ts";
import { EaCToolDetails } from "../../eac/EaCToolDetails.ts";
import { EaCVectorStoreDetails } from "../../eac/EaCVectorStoreDetails.ts";
import { EaCLLMAsCode } from "../../eac/llms/EaCLLMAsCode.ts";
import { EaCEmbeddingsAsCode } from "../../eac/EaCEmbeddingsAsCode.ts";
import { EaCIndexerAsCode } from "../../eac/EaCIndexerAsCode.ts";
import { EaCDocumentLoaderAsCode } from "../../eac/EaCDocumentLoaderAsCode.ts";
import { EaCPersistenceAsCode } from "../../eac/EaCPersistenceAsCode.ts";
import { EaCPersonalityAsCode } from "../../eac/EaCPersonalityAsCode.ts";
import { EaCRetrieverAsCode } from "../../eac/EaCRetrieverAsCode.ts";
import { EaCTextSplitterAsCode } from "../../eac/EaCTextSplitterAsCode.ts";
import { EaCToolAsCode } from "../../eac/EaCToolAsCode.ts";
import { EaCVectorStoreAsCode } from "../../eac/EaCVectorStoreAsCode.ts";
import { EaCChatHistoryAsCode } from "../../eac/EaCChatHistoryAsCode.ts";
import {
  ChatHistory as ChatHistoryLookup,
  ChatHistoryLookupToken,
  DocumentLoader as DocumentLoaderLookup,
  DocumentLoaderLookupToken,
  Embeddings as EmbeddingsLookup,
  EmbeddingsLookupToken,
  Indexer as IndexerLookup,
  IndexerLookupToken,
  LLM as LLMLookup,
  LLMLookupToken,
  Persistence as PersistenceLookup,
  PersistenceLookupToken,
  Personality as PersonalityLookup,
  PersonalityLookupToken,
  Retriever as RetrieverLookup,
  RetrieverLookupToken,
  TextSplitter as TextSplitterLookup,
  TextSplitterLookupToken,
  Tool as ToolLookup,
  ToolLookupToken,
  VectorStore as VectorStoreLookup,
  VectorStoreLookupToken,
} from "../lookups/index.ts";

export class AIWorkspace {
  protected readonly aiName: string;

  protected readonly ai: EaCAIAsCode;

  constructor(aiName: string, _aiToken?: string) {
    this.aiName = aiName;
    this.ai = { Details: {} } as EaCAIAsCode;
  }

  public LLM(lookup: string, details: EaCLLMDetails): LLMLookupToken {
    this.ai.LLMs = this.ai.LLMs || {};
    this.ai.LLMs[lookup] = { Details: details } as EaCLLMAsCode;
    return LLMLookup(lookup, this.aiName);
  }

  public Embeddings(
    lookup: string,
    details: EaCEmbeddingsDetails,
  ): EmbeddingsLookupToken {
    this.ai.Embeddings = this.ai.Embeddings || {};
    this.ai.Embeddings[lookup] = { Details: details } as EaCEmbeddingsAsCode;
    return EmbeddingsLookup(lookup, this.aiName);
  }

  public Indexer(
    lookup: string,
    details: EaCIndexerDetails,
  ): IndexerLookupToken {
    this.ai.Indexers = this.ai.Indexers || {};
    this.ai.Indexers[lookup] = { Details: details } as EaCIndexerAsCode;
    return IndexerLookup(lookup, this.aiName);
  }

  public Loader(
    lookup: string,
    details: EaCDocumentLoaderDetails,
  ): DocumentLoaderLookupToken {
    this.ai.Loaders = this.ai.Loaders || {};
    this.ai.Loaders[lookup] = { Details: details } as EaCDocumentLoaderAsCode;
    return DocumentLoaderLookup(lookup, this.aiName);
  }

  public Persistence(
    lookup: string,
    details: EaCPersistenceDetails,
  ): PersistenceLookupToken {
    this.ai.Persistence = this.ai.Persistence || {};
    this.ai.Persistence[lookup] = { Details: details } as EaCPersistenceAsCode;
    return PersistenceLookup(lookup, this.aiName);
  }

  public Personality(
    lookup: string,
    details: EaCPersonalityDetails,
  ): PersonalityLookupToken {
    this.ai.Personalities = this.ai.Personalities || {};
    this.ai.Personalities[lookup] = {
      Details: details,
    } as EaCPersonalityAsCode;
    return PersonalityLookup(lookup, this.aiName);
  }

  public Retriever(
    lookup: string,
    details: EaCRetrieverDetails,
  ): RetrieverLookupToken {
    this.ai.Retrievers = this.ai.Retrievers || {};
    this.ai.Retrievers[lookup] = { Details: details } as EaCRetrieverAsCode;
    return RetrieverLookup(lookup, this.aiName);
  }

  public TextSplitter(
    lookup: string,
    details: EaCTextSplitterDetails,
  ): TextSplitterLookupToken {
    this.ai.TextSplitters = this.ai.TextSplitters || {};
    this.ai.TextSplitters[lookup] = {
      Details: details,
    } as EaCTextSplitterAsCode;
    return TextSplitterLookup(lookup, this.aiName);
  }

  public Tool(lookup: string, details: EaCToolDetails): ToolLookupToken {
    this.ai.Tools = this.ai.Tools || {};
    this.ai.Tools[lookup] = { Details: details } as EaCToolAsCode;
    return ToolLookup(lookup, this.aiName);
  }

  public VectorStore(
    lookup: string,
    details: EaCVectorStoreDetails,
  ): VectorStoreLookupToken {
    this.ai.VectorStores = this.ai.VectorStores || {};
    this.ai.VectorStores[lookup] = { Details: details } as EaCVectorStoreAsCode;
    return VectorStoreLookup(lookup, this.aiName);
  }

  public ChatHistory(
    lookup: string,
    details: Record<string, unknown>,
  ): ChatHistoryLookupToken {
    this.ai.ChatHistories = this.ai.ChatHistories || {};
    // loosen for now; wire detailed type when available
    this.ai.ChatHistories[lookup] = {
      Details: details,
    } as EaCChatHistoryAsCode;
    return ChatHistoryLookup(lookup, this.aiName);
  }

  public Build(): EaCAIAsCode {
    return this.ai;
  }
}
