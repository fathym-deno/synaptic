import { Brand } from "../resources/ResourceBuilder.ts";
import { ChatHistoryId } from "../resources/ChatHistoryBuilder.ts";
import { DocumentLoaderId } from "../resources/DocumentLoaderBuilder.ts";
import { EmbeddingsId } from "../resources/EmbeddingsBuilder.ts";
import { IndexerId } from "../resources/IndexerBuilder.ts";
import { LLMId } from "../resources/LLMBuilder.ts";
import { PersistenceId } from "../resources/PersistenceBuilder.ts";
import { PersonalityId } from "../resources/PersonalityBuilder.ts";
import { RetrieverId } from "../resources/RetrieverBuilder.ts";
import { TextSplitterId } from "../resources/TextSplitterBuilder.ts";
import { ToolId } from "../resources/ToolBuilder.ts";
import { VectorStoreId } from "../resources/VectorStoreBuilder.ts";

export type LookupToken<T extends string> = Brand<string, T>;

function scoped<T extends string>(
  lookup: string,
  scope: string,
): LookupToken<T> {
  return `${scope}|${lookup}` as LookupToken<T>;
}

export type AILookupToken = LookupToken<"AI">;
export function AI(lookup: string, scope: string): AILookupToken {
  return scoped<"AI">(lookup, scope);
}

export type CircuitLookupToken = LookupToken<"Circuit">;
export function Circuit(lookup: string, scope: string): CircuitLookupToken {
  return scoped<"Circuit">(lookup, scope);
}

export type ChatHistoryLookupToken = LookupToken<"ChatHistory">;
export function ChatHistory(
  lookup: string,
  scope: string,
): ChatHistoryLookupToken;
export function ChatHistory(
  lookup: ChatHistoryId,
  scope: string,
): ChatHistoryLookupToken;
export function ChatHistory(
  lookup: string | ChatHistoryId,
  scope: string,
): ChatHistoryLookupToken {
  return scoped<"ChatHistory">(lookup, scope);
}

export type DocumentLoaderLookupToken = LookupToken<"DocumentLoader">;
export function DocumentLoader(
  lookup: string,
  scope: string,
): DocumentLoaderLookupToken;
export function DocumentLoader(
  lookup: DocumentLoaderId,
  scope: string,
): DocumentLoaderLookupToken;
export function DocumentLoader(
  lookup: string | DocumentLoaderId,
  scope: string,
): DocumentLoaderLookupToken {
  return scoped<"DocumentLoader">(lookup, scope);
}

export type EmbeddingsLookupToken = LookupToken<"Embeddings">;
export function Embeddings(
  lookup: string,
  scope: string,
): EmbeddingsLookupToken;
export function Embeddings(
  lookup: EmbeddingsId,
  scope: string,
): EmbeddingsLookupToken;
export function Embeddings(
  lookup: string | EmbeddingsId,
  scope: string,
): EmbeddingsLookupToken {
  return scoped<"Embeddings">(lookup, scope);
}

export type IndexerLookupToken = LookupToken<"Indexer">;
export function Indexer(
  lookup: string,
  scope: string,
): IndexerLookupToken;
export function Indexer(
  lookup: IndexerId,
  scope: string,
): IndexerLookupToken;
export function Indexer(
  lookup: string | IndexerId,
  scope: string,
): IndexerLookupToken {
  return scoped<"Indexer">(lookup, scope);
}

export type LLMLookupToken = LookupToken<"LLM">;
export function LLM(lookup: string, scope: string): LLMLookupToken;
export function LLM(lookup: LLMId, scope: string): LLMLookupToken;
export function LLM(
  lookup: string | LLMId,
  scope: string,
): LLMLookupToken {
  return scoped<"LLM">(lookup, scope);
}

export type PersistenceLookupToken = LookupToken<"Persistence">;
export function Persistence(
  lookup: string,
  scope: string,
): PersistenceLookupToken;
export function Persistence(
  lookup: PersistenceId,
  scope: string,
): PersistenceLookupToken;
export function Persistence(
  lookup: string | PersistenceId,
  scope: string,
): PersistenceLookupToken {
  return scoped<"Persistence">(lookup, scope);
}

export type PersonalityLookupToken = LookupToken<"Personality">;
export function Personality(
  lookup: string,
  scope: string,
): PersonalityLookupToken;
export function Personality(
  lookup: PersonalityId,
  scope: string,
): PersonalityLookupToken;
export function Personality(
  lookup: string | PersonalityId,
  scope: string,
): PersonalityLookupToken {
  return scoped<"Personality">(lookup, scope);
}

export type RetrieverLookupToken = LookupToken<"Retriever">;
export function Retriever(
  lookup: string,
  scope: string,
): RetrieverLookupToken;
export function Retriever(
  lookup: RetrieverId,
  scope: string,
): RetrieverLookupToken;
export function Retriever(
  lookup: string | RetrieverId,
  scope: string,
): RetrieverLookupToken {
  return scoped<"Retriever">(lookup, scope);
}

export type TextSplitterLookupToken = LookupToken<"TextSplitter">;
export function TextSplitter(
  lookup: string,
  scope: string,
): TextSplitterLookupToken;
export function TextSplitter(
  lookup: TextSplitterId,
  scope: string,
): TextSplitterLookupToken;
export function TextSplitter(
  lookup: string | TextSplitterId,
  scope: string,
): TextSplitterLookupToken {
  return scoped<"TextSplitter">(lookup, scope);
}

export type ToolLookupToken = LookupToken<"Tool">;
export function Tool(lookup: string, scope: string): ToolLookupToken;
export function Tool(lookup: ToolId, scope: string): ToolLookupToken;
export function Tool(
  lookup: string | ToolId,
  scope: string,
): ToolLookupToken {
  return scoped<"Tool">(lookup, scope);
}

export type VectorStoreLookupToken = LookupToken<"VectorStore">;
export function VectorStore(
  lookup: string,
  scope: string,
): VectorStoreLookupToken;
export function VectorStore(
  lookup: VectorStoreId,
  scope: string,
): VectorStoreLookupToken;
export function VectorStore(
  lookup: string | VectorStoreId,
  scope: string,
): VectorStoreLookupToken {
  return scoped<"VectorStore">(lookup, scope);
}
