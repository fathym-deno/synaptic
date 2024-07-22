import { EaCAzureOpenAIEmbeddingsDetails } from '../src/eac/EaCAzureOpenAIEmbeddingsDetails.ts';
import { EaCAzureOpenAILLMDetails } from '../src/eac/EaCAzureOpenAILLMDetails.ts';
import { EaCAzureSearchAIVectorStoreDetails } from '../src/eac/EaCAzureSearchAIVectorStoreDetails.ts';
import { EaCCheerioWebDocumentLoaderDetails } from '../src/eac/EaCCheerioWebDocumentLoaderDetails.ts';
import { EaCDenoKVChatHistoryDetails } from '../src/eac/EaCDenoKVChatHistoryDetails.ts';
import { EaCDenoKVIndexerDetails } from '../src/eac/EaCDenoKVIndexerDetails.ts';
import { EaCDenoKVSaverPersistenceDetails } from '../src/eac/EaCDenoKVSaverPersistenceDetails.ts';
import { EaCMemorySaverPersistenceDetails } from '../src/eac/EaCMemorySaverPersistenceDetails.ts';
import { EaCRecursiveCharacterTextSplitterDetails } from '../src/eac/EaCRecursiveCharacterTextSplitterDetails.ts';
import { EaCSERPToolDetails } from '../src/eac/tools/EaCSERPToolDetails.ts';
import { EaCTavilySearchResultsToolDetails } from '../src/eac/tools/EaCTavilySearchResultsToolDetails.ts';
import {
  AzureAISearchQueryType,
  EaCDatabaseAsCode,
  EaCDenoKVDatabaseDetails,
  EaCLocalDistributedFileSystem,
} from './tests.deps.ts';

export const eacAIsRoot = {
  Details: {
    Name: 'Thinky AI',
    Description: 'The Thinky AI for product workflow management.',
  },
  ChatHistories: {
    thinky: {
      Details: {
        Type: 'DenoKV',
        Name: 'Thinky',
        Description: 'The Thinky document indexer to use.',
        DenoKVDatabaseLookup: 'thinky',
        RootKey: ['Thinky', 'EaC', 'ChatHistory'],
      } as EaCDenoKVChatHistoryDetails,
    },
  },
  Embeddings: {
    thinky: {
      Details: {
        Type: 'AzureOpenAI',
        Name: 'Azure OpenAI LLM',
        Description: 'The LLM for interacting with Azure OpenAI.',
        APIKey: Deno.env.get('AZURE_OPENAI_KEY')!,
        Endpoint: Deno.env.get('AZURE_OPENAI_ENDPOINT')!,
        DeploymentName: 'text-embedding-ada-002',
      } as EaCAzureOpenAIEmbeddingsDetails,
    },
  },
  Indexers: {
    main: {
      Details: {
        Type: 'DenoKV',
        Name: 'Thinky',
        Description: 'The Thinky document indexer to use.',
        DenoKVDatabaseLookup: 'thinky',
        RootKey: ['Thinky', 'EaC', 'Indexers'],
      } as EaCDenoKVIndexerDetails,
    },
  },
  LLMs: {
    thinky: {
      Details: {
        Type: 'AzureOpenAI',
        Name: 'Azure OpenAI LLM',
        Description: 'The LLM for interacting with Azure OpenAI.',
        APIKey: Deno.env.get('AZURE_OPENAI_KEY')!,
        Endpoint: Deno.env.get('AZURE_OPENAI_ENDPOINT')!,
        DeploymentName: 'gpt-4o',
        ModelName: 'gpt-4o',
        Streaming: true,
        Verbose: false,
      } as EaCAzureOpenAILLMDetails,
    },
    'thinky-tooled': {
      Details: {
        Type: 'AzureOpenAI',
        Name: 'Azure OpenAI LLM',
        Description: 'The LLM for interacting with Azure OpenAI.',
        APIKey: Deno.env.get('AZURE_OPENAI_KEY')!,
        Endpoint: Deno.env.get('AZURE_OPENAI_ENDPOINT')!,
        DeploymentName: 'gpt-4o',
        ModelName: 'gpt-4o',
        Streaming: true,
        Verbose: false,
        ToolLookups: ['thinky|tavily'],
      } as EaCAzureOpenAILLMDetails,
    },
  },
  Loaders: {
    fathym: {
      Details: {
        Type: 'CheerioWeb',
        URLs: ['https://www.fathym.com'],
      } as EaCCheerioWebDocumentLoaderDetails,
    },
  },
  Persistence: {
    denokv: {
      Details: {
        Type: 'DenoKVSaver',
        DatabaseLookup: 'thinky',
        RootKey: ['Thinky', 'EaC'],
        CheckpointTTL: 1 * 1000 * 60 * 60 * 24 * 7, // 7 Days
      } as EaCDenoKVSaverPersistenceDetails,
    },
    memory: {
      Details: {
        Type: 'MemorySaver',
      } as EaCMemorySaverPersistenceDetails,
    },
  },
  TextSplitters: {
    html: {
      Details: {
        Type: 'RecursiveCharacter',
        FromLanguage: 'html',
        TransformerLookup: 'HtmlToText',
      } as EaCRecursiveCharacterTextSplitterDetails,
    },
    main: {
      Details: {
        Type: 'RecursiveCharacter',
        ChunkOverlap: 50,
        ChunkSize: 300,
      } as EaCRecursiveCharacterTextSplitterDetails,
    },
  },
  Tools: {
    serp: {
      Details: {
        Type: 'SERP',
        APIKey: Deno.env.get('SERP_API_KEY')!,
      } as EaCSERPToolDetails,
    },
    tavily: {
      Details: {
        Type: 'TavilySearchResults',
        APIKey: Deno.env.get('TAVILY_API_KEY')!,
      } as EaCTavilySearchResultsToolDetails,
    },
  },
  VectorStores: {
    thinky: {
      Details: {
        Type: 'AzureSearchAI',
        Name: 'Azure Search AI',
        Description: 'The Vector Store for interacting with Azure Search AI.',
        APIKey: Deno.env.get('AZURE_AI_SEARCH_KEY')!,
        Endpoint: Deno.env.get('AZURE_AI_SEARCH_ENDPOINT')!,
        EmbeddingsLookup: 'thinky',
        IndexerLookup: 'thinky',
        QueryType: AzureAISearchQueryType.SimilarityHybrid,
      } as EaCAzureSearchAIVectorStoreDetails,
    },
  },
};

export const eacDatabases = {
  Details: {
    Type: 'DenoKV',
    Name: 'Thinky',
    Description: 'The Deno KV database to use for thinky',
    DenoKVPath: Deno.env.get('THINKY_DENO_KV_PATH') || undefined,
  } as EaCDenoKVDatabaseDetails,
} as EaCDatabaseAsCode;

export const eacDFSSynapticResolvers = {
  Type: 'Local',
  FileRoot: './src/resolvers/',
  Extensions: ['resolver.ts'],
} as EaCLocalDistributedFileSystem;
