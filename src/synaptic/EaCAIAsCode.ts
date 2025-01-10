
import { EaCDetails, EaCDetailsSchema, z } from "./.deps.ts";
import { EaCAIDetails, EaCAIDetailsSchema, isEaCAIDetails } from "./EaCAIDetails.ts";
import { EaCChatHistoryAsCode, EaCChatHistoryAsCodeSchema } from "./history/EaCChatHistoryAsCode.ts";
import { EaCDocumentLoaderAsCode, EaCDocumentLoaderAsCodeSchema } from "./loaders/EaCDocumentLoaderAsCode.ts";
import { EaCEmbeddingsAsCode, EaCEmbeddingsAsCodeSchema } from "./embeddings/EaCEmbeddingsAsCode.ts";
import { EaCIndexerAsCode, EaCIndexerAsCodeSchema } from "./indexers/EaCIndexerAsCode.ts";
import { EaCLLMAsCode, EaCLLMAsCodeSchema } from "./llms/EaCLLMAsCode.ts";
import { EaCPersistenceAsCode, EaCPersistenceAsCodeSchema } from "./persistence/EaCPersistenceAsCode.ts";
import { EaCPersonalityAsCode, EaCPersonalityAsCodeSchema } from "./personalities/EaCPersonalityAsCode.ts";
import { EaCRetrieverAsCode, EaCRetrieverAsCodeSchema } from "./retrievers/EaCRetrieverAsCode.ts";
import { EaCTextSplitterAsCode, EaCTextSplitterAsCodeSchema } from "./text-splitters/EaCTextSplitterAsCode.ts";
import { EaCToolAsCode, EaCToolAsCodeSchema } from "./tools/EaCToolAsCode.ts";
import { EaCVectorStoreAsCode, EaCVectorStoreAsCodeSchema } from "./vector-stores/EaCVectorStoreAsCode.ts";

/**
 * Represents AI-related configurations in the Everything as Code (EaC) framework.
 *
 * Combines AI-specific details with various components like chat histories, embeddings,
 * loaders, retrievers, tools, and more for comprehensive AI workflow management.
 */
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

/**
 * Schema for `EaCAIAsCode`.
 * Validates the structure, ensuring compatibility with AI-related components and their details.
 */
export const EaCAIAsCodeSchema: z.ZodObject<
  {
    ChatHistories: z.ZodOptional<z.ZodRecord<z.ZodString, typeof EaCChatHistoryAsCodeSchema>>;
    Embeddings: z.ZodOptional<z.ZodRecord<z.ZodString, typeof EaCEmbeddingsAsCodeSchema>>;
    Indexers: z.ZodOptional<z.ZodRecord<z.ZodString, typeof EaCIndexerAsCodeSchema>>;
    LLMs: z.ZodOptional<z.ZodRecord<z.ZodString, typeof EaCLLMAsCodeSchema>>;
    Loaders: z.ZodOptional<z.ZodRecord<z.ZodString, typeof EaCDocumentLoaderAsCodeSchema>>;
    Persistence: z.ZodOptional<z.ZodRecord<z.ZodString, typeof EaCPersistenceAsCodeSchema>>;
    Personalities: z.ZodOptional<z.ZodRecord<z.ZodString, typeof EaCPersonalityAsCodeSchema>>;
    Retrievers: z.ZodOptional<z.ZodRecord<z.ZodString, typeof EaCRetrieverAsCodeSchema>>;
    TextSplitters: z.ZodOptional<z.ZodRecord<z.ZodString, typeof EaCTextSplitterAsCodeSchema>>;
    Tools: z.ZodOptional<z.ZodRecord<z.ZodString, typeof EaCToolAsCodeSchema>>;
    VectorStores: z.ZodOptional<z.ZodRecord<z.ZodString, typeof EaCVectorStoreAsCodeSchema>>;
    Details: z.ZodOptional<typeof EaCAIDetailsSchema>;
  },
  "strip",
  z.ZodTypeAny,
  EaCAIAsCode,
  EaCAIAsCode
> = EaCDetailsSchema.extend({
  ChatHistories: z.record(EaCChatHistoryAsCodeSchema).optional(),
  Embeddings: z.record(EaCEmbeddingsAsCodeSchema).optional(),
  Indexers: z.record(EaCIndexerAsCodeSchema).optional(),
  LLMs: z.record(EaCLLMAsCodeSchema).optional(),
  Loaders: z.record(EaCDocumentLoaderAsCodeSchema).optional(),
  Persistence: z.record(EaCPersistenceAsCodeSchema).optional(),
  Personalities: z.record(EaCPersonalityAsCodeSchema).optional(),
  Retrievers: z.record(EaCRetrieverAsCodeSchema).optional(),
  TextSplitters: z.record(EaCTextSplitterAsCodeSchema).optional(),
  Tools: z.record(EaCToolAsCodeSchema).optional(),
  VectorStores: z.record(EaCVectorStoreAsCodeSchema).optional(),
  Details: EaCAIDetailsSchema.optional(),
}).describe(
  "Schema for EaCAIAsCode, defining AI-specific configurations, details, and related components for comprehensive management.",
);

/**
 * Type guard for `EaCAIAsCode`.
 * Validates if the given object conforms to the `EaCAIAsCode` structure.
 *
 * @param eac - The object to validate.
 * @returns True if the object is a valid `EaCAIAsCode`, false otherwise.
 */
export function isEaCAIAsCode(eac: unknown): eac is EaCAIAsCode {
  const result = EaCAIAsCodeSchema.safeParse(eac);
  return result.success && isEaCAIDetails(result.data.Details);
}

/**
 * Validates and parses an object as `EaCAIAsCode`.
 *
 * @param eac - The object to validate and parse.
 * @throws If the object does not conform to the `EaCAIAsCodeSchema`.
 * @returns The parsed `EaCAIAsCode` object.
 */
export function parseEaCAIAsCode(eac: unknown): EaCAIAsCode {
  return EaCAIAsCodeSchema.parse(eac);
}
