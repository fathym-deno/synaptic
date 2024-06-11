import { EaCAIAsCode, EaCMetadataBase } from "../src.deps.ts";
import { EaCCircuitAsCode } from "./EaCCircuitAsCode.ts";
import { EaCDocumentLoaderAsCode } from "./EaCDocumentLoaderAsCode.ts";
import { EaCIndexerAsCode } from "./EaCIndexerAsCode.ts";
import { EaCNeuron } from "./EaCNeuron.ts";
import { EaCPersistenceAsCode } from "./EaCPersistenceAsCode.ts";
import { EaCRetrieverAsCode } from "./EaCRetrieverAsCode.ts";
import { EaCTextSplitterAsCode } from "./EaCTextSplitterAsCode.ts";
import { EaCToolAsCode } from "./EaCToolAsCode.ts";
import { EaCVectorStoreAsCode } from "./EaCVectorStoreAsCode.ts";

export type EaCSynapticAIAsCode = {
  Indexers?: Record<string, EaCIndexerAsCode>;

  Loaders?: Record<string, EaCDocumentLoaderAsCode>;

  Persistence?: Record<string, EaCPersistenceAsCode>;

  TextSplitters?: Record<string, EaCTextSplitterAsCode>;

  Tools?: Record<string, EaCToolAsCode>;

  VectorStores?: Record<string, EaCVectorStoreAsCode>;
} & EaCAIAsCode;

export type EverythingAsCodeSynaptic = {
  AIs?: Record<string, EaCSynapticAIAsCode>;

  Circuits?:
    & { $neurons?: Record<string, EaCNeuron> }
    & Record<
      string,
      EaCCircuitAsCode
    >;

  Retrievers?: Record<string, EaCRetrieverAsCode>;
} & EaCMetadataBase;

export function isEverythingAsCodeSynaptic(
  eac: unknown,
): eac is EverythingAsCodeSynaptic {
  const synEaC = eac as EverythingAsCodeSynaptic;

  return synEaC && synEaC.AIs !== undefined && synEaC.Circuits !== undefined;
}