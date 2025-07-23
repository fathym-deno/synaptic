// deno-lint-ignore-file no-explicit-any
import {
  AzureAISearchVectorStore,
  AzureChatOpenAI,
  AzureOpenAIEmbeddings,
  BaseDocumentLoader,
  BaseLanguageModel,
  ChatOpenAI,
  CheerioWebBaseLoader,
  DFSFileHandlerResolver,
  DynamicStructuredTool,
  DynamicTool,
  EaCJSRDistributedFileSystemDetails,
  EaCLocalDistributedFileSystemDetails,
  EaCRuntimeConfig,
  EaCRuntimeHandlerRouteGroup,
  EaCRuntimePlugin,
  EaCRuntimePluginConfig,
  Embeddings,
  // formatToOpenAIFunction,
  // formatToOpenAITool,
  HNSWLib,
  HtmlToTextTransformer,
  importDFSTypescriptModule,
  IoCContainer,
  IS_BUILDING,
  JSONLoader,
  jsonSchemaToZod,
  LoggingProvider,
  MemorySaver,
  MemoryVectorStore,
  mergeWithArrays,
  // PDFLoader,
  RecursiveCharacterTextSplitter,
  RemoteRunnable,
  Runnable,
  RunnableConfig,
  RunnableLambda,
  SerpAPI,
  StructuredTool,
  StructuredToolInterface,
  TavilySearchResults,
  TextSplitter,
  toBlob,
  Toolkit,
  VectorStore,
  WatsonxAI,
  z,
  ZodObject,
} from "../src.deps.ts";
import {
  EaCHNSWVectorStoreDetails,
  isEaCHNSWVectorStoreDetails,
} from "../eac/EaCHNSWVectorStoreDetails.ts";
import { isEaCMemoryVectorStoreDetails } from "../eac/EaCMemoryVectorStoreDetails.ts";
import {
  EaCAzureSearchAIVectorStoreDetails,
  isEaCAzureSearchAIVectorStoreDetails,
} from "../eac/EaCAzureSearchAIVectorStoreDetails.ts";
import {
  EaCDenoKVIndexerDetails,
  isEaCDenoKVIndexerDetails,
} from "../eac/EaCDenoKVIndexerDetails.ts";
import { DenoKVRecordManager } from "../indexing/DenoKVRecordManager.ts";
import {
  EaCCheerioWebDocumentLoaderDetails,
  isEaCCheerioWebDocumentLoaderDetails,
} from "../eac/EaCCheerioWebDocumentLoaderDetails.ts";
import { EverythingAsCodeSynaptic } from "../eac/EverythingAsCodeSynaptic.ts";
import { DenoKVChatMessageHistory } from "../memory/DenoKVChatMessageHistory.ts";
import { EaCNeuron, EaCNeuronLike } from "../eac/EaCNeuron.ts";
import {
  EaCRecursiveCharacterTextSplitterDetails,
  isEaCRecursiveCharacterTextSplitterDetails,
} from "../eac/EaCRecursiveCharacterTextSplitterDetails.ts";
import { isEaCSERPToolDetails } from "../eac/tools/EaCSERPToolDetails.ts";
import { isEaCTavilySearchResultsToolDetails } from "../eac/tools/EaCTavilySearchResultsToolDetails.ts";
import { isEaCDynamicToolDetails } from "../eac/tools/EaCDynamicToolDetails.ts";
import { isEaCMemorySaverPersistenceDetails } from "../eac/EaCMemorySaverPersistenceDetails.ts";
import { isEaCDenoKVSaverPersistenceDetails } from "../eac/EaCDenoKVSaverPersistenceDetails.ts";
import { DenoKVSaver } from "../memory/DenoKVSaver.ts";
import { isEaCCircuitToolDetails } from "../eac/tools/EaCCircuitToolDetails.ts";
import { EaCSynapticCircuitsProcessorHandlerResolver } from "./EaCSynapticCircuitsProcessorHandlerResolver.ts";
import { isEaCRemoteCircuitsToolDetails } from "../eac/tools/EaCRemoteCircuitsToolDetails.ts";
import {
  EaCDenoKVChatHistoryDetails,
  isEaCDenoKVChatHistoryDetails,
} from "../eac/EaCDenoKVChatHistoryDetails.ts";
import {
  EaCAzureOpenAIEmbeddingsDetails,
  isEaCAzureOpenAIEmbeddingsDetails,
} from "../eac/EaCAzureOpenAIEmbeddingsDetails.ts";
import {
  EaCAzureOpenAILLMDetails,
  isEaCAzureOpenAILLMDetails,
} from "../eac/llms/EaCAzureOpenAILLMDetails.ts";
import {
  EaCWatsonXLLMDetails,
  isEaCWatsonXLLMDetails,
} from "../eac/llms/EaCWatsonXLLMDetails.ts";
import { SynapticNeuronResolver } from "../resolvers/SynapticNeuronResolver.ts";
import { SynapticResolverConfiguration } from "../resolvers/SynapticResolverConfiguration.ts";
import { SynapticCircuitResolver } from "../resolvers/SynapticCircuitResolver.ts";
import {
  EaCCompoundDocumentLoaderDetails,
  isEaCCompoundDocumentLoaderDetails,
} from "../eac/EaCCompoundDocumentLoaderDetails.ts";
import {
  EaCDFSDocumentLoaderDetails,
  isEaCDFSDocumentLoaderDetails,
} from "../eac/EaCDFSDocumentLoaderDetails.ts";
import { EaCPersonalityDetails } from "../eac/EaCPersonalityDetails.ts";
import { loadRetrieverDocs } from "../utils/loadRetrieverDocs.ts";
import {
  EaCOpenAILLMDetails,
  isEaCOpenAILLMDetails,
} from "../eac/llms/EaCOpenAILLMDetails.ts";
import { CircuitConfiguration } from "../circuits/CircuitConfiguration.ts";
import { CircuitContext } from "../circuits/CircuitContext.ts";
import { EaCCircuitNeuron } from "../eac/neurons/EaCCircuitNeuron.ts";
import {
  EaCSchemaDocumentLoaderDetails,
  isEaCSchemaDocumentLoaderDetails,
} from "../eac/EaCSchemaDocumentLoaderDetails.ts";

export default class FathymSynapticPlugin implements EaCRuntimePlugin {
  protected dfsHandlerResolver: DFSFileHandlerResolver | undefined;

  constructor(
    protected isLocal = false,
    protected pdfLoaderFactory?: (contents: Blob) => BaseDocumentLoader,
  ) {}

  public async AfterEaCResolved(
    eac: EverythingAsCodeSynaptic,
    ioc: IoCContainer,
  ): Promise<EaCRuntimeHandlerRouteGroup[]> {
    if (!IS_BUILDING && !Deno.args.includes("publish")) {
      await this.configureEaCSynaptic(eac, ioc);
    }

    return [];
  }

  public async Build(
    eac: EverythingAsCodeSynaptic,
    ioc: IoCContainer,
    _pluginCfg?: EaCRuntimePluginConfig<EverythingAsCodeSynaptic>,
  ): Promise<void> {
    const logger = await ioc.Resolve(LoggingProvider);

    this.dfsHandlerResolver = await ioc.Resolve<DFSFileHandlerResolver>(
      ioc.Symbol("DFSFileHandler"),
    );

    const circuitDFSLookups = eac.Circuits?.$circuitsDFSLookups ?? [];

    const circuits = (
      await Promise.all(
        circuitDFSLookups.map(async (dfsLookup) => {
          const dfs = eac.DFSs?.[dfsLookup]?.Details;

          if (dfs) {
            const dfsHandler = await this.dfsHandlerResolver!.Resolve(
              ioc,
              dfsLookup,
              dfs,
              eac.$GlobalOptions?.DFSs ?? {},
            );

            return {
              dfsLookup,
              dfs,
              fileHandler: dfsHandler,
              paths: await dfsHandler?.LoadAllPaths(Date.now().toString()),
            };
          } else {
            return {};
          }
        }),
      )
    )
      .filter((s) => !!s?.fileHandler)
      .map((s) => {
        return {
          dfsLookup: s.dfsLookup!,
          dfs: s.dfs!,
          fileHandler: s.fileHandler!,
          paths: s.paths ?? [],
        };
      });

    await Promise.all(
      circuits.map(async ({ dfsLookup, dfs, fileHandler, paths }) => {
        const fileModules = (
          await Promise.all(
            paths
              // TODO(mcgear): Make extensions configurable... Maybe all DFSs should have an extensions options to trim them down
              ?.filter((p) => p.endsWith("ts") || p.endsWith("tsx"))
              .map(async (path) => {
                const module = await importDFSTypescriptModule(
                  logger.Package,
                  fileHandler,
                  path,
                  dfs,
                  dfsLookup,
                  "ts",
                );

                return { module, path };
              }) || [],
          )
        )
          .filter((m) => !!m?.module?.module?.Configure)
          .map(({ module, path }) => ({ module: module!, path }));

        if (!eac.Circuits) {
          eac.Circuits = {};
        }

        if (!eac.Circuits.$neurons) {
          eac.Circuits.$neurons = {};
        }

        for (const { module, path } of fileModules) {
          const configure: CircuitConfiguration<"Graph" | "Linear"> =
            module.module.Configure;

          if (typeof configure === "function") {
            let circuitLookup = path.slice(2, -3);

            if (circuitLookup.endsWith("/index")) {
              circuitLookup = circuitLookup.slice(0, -6);
            }

            circuitLookup = circuitLookup.replaceAll("/", ":");

            const ctx: CircuitContext = {
              AIaCLookup(lookup, scope) {
                return `${scope ?? circuitLookup}|${lookup}`;
              },
              CircuitLookup: circuitLookup,
              EaC: eac,
              IoC: ioc,
            };

            const result = await configure(ctx);

            const { AIaC, $neurons, ...circuitDetails } = result;

            eac.Circuits![circuitLookup] = {
              Details: circuitDetails,
            };

            eac.Circuits!.$neurons = {
              ...eac.Circuits!.$neurons,
              [circuitLookup]: {
                Type: "Circuit",
                CircuitLookup: circuitLookup,
              } as EaCCircuitNeuron,
              ...Object.keys($neurons ?? {}).reduce((acc, next) => {
                acc[`${next}`] = $neurons![next];

                return acc;
              }, {} as Record<string, EaCNeuronLike>),
            };

            eac.AIs![circuitLookup] = AIaC || {};
          } else {
            // TODO(mcgear): What to do if this isn't the case? If anything
          }
        }
      }),
    );
  }

  public Setup(_config: EaCRuntimeConfig): Promise<EaCRuntimePluginConfig> {
    const pluginConfig: EaCRuntimePluginConfig = {
      Name: FathymSynapticPlugin.name,
      IoC: new IoCContainer(),
    };

    pluginConfig.IoC!.Register(
      () => EaCSynapticCircuitsProcessorHandlerResolver,
      {
        Name: "EaCSynapticCircuitsProcessor",
        Type: pluginConfig.IoC!.Symbol("ProcessorHandlerResolver"),
      },
    );

    return Promise.resolve(pluginConfig);
  }

  protected configureEaCChatHistories(
    eac: EverythingAsCodeSynaptic,
    ioc: IoCContainer,
  ): void {
    const aiLookups = Object.keys(eac!.AIs || {});

    aiLookups.forEach((aiLookup) => {
      const ai = eac!.AIs![aiLookup]!;

      const chatHistoryLookups = Object.keys(ai.ChatHistories || {});

      chatHistoryLookups.forEach((chatHistoryLookup) => {
        const chatHistory = ai.ChatHistories![chatHistoryLookup]!;

        if (isEaCDenoKVChatHistoryDetails(chatHistory.Details)) {
          const chDetails = chatHistory.Details as EaCDenoKVChatHistoryDetails;

          ioc.Register(
            async () => {
              const kv = await ioc.Resolve(
                Deno.Kv,
                chDetails.DenoKVDatabaseLookup,
              );

              return (sessionId: string) =>
                new DenoKVChatMessageHistory(sessionId, {
                  KV: kv,
                  RootKey: chDetails.RootKey,
                });
            },
            {
              Lazy: false,
              Name: `${aiLookup}|${chatHistoryLookup}`,
              Type: ioc.Symbol("ChatHistory"),
            },
          );
        }
      });
    });
  }

  protected async configureEaCCircuits(
    eac: EverythingAsCodeSynaptic,
    ioc: IoCContainer,
  ): Promise<void> {
    const {
      $circuitsDFSLookups: _$c,
      $resolvers: _$r,
      $neurons: _$n,
      $remotes,
      ...circuits
    } = eac.Circuits || {};

    if ($remotes) {
      const remoteLookups = Object.keys($remotes);

      const remoteCircuitDefs = await Promise.all(
        remoteLookups.map(async (remoteLookup) => {
          const remoteCircuitUrl = $remotes[remoteLookup]!;

          try {
            const circuitDefsResp = await fetch(remoteCircuitUrl);

            const circuitDefs: Record<string, RemoteCircuitDefinition> =
              await circuitDefsResp.json();

            return [remoteLookup, circuitDefs] as [
              string,
              Record<string, RemoteCircuitDefinition> | undefined,
            ];
          } catch (_ex) {
            return [remoteLookup, undefined] as [
              string,
              Record<string, RemoteCircuitDefinition> | undefined,
            ];
          }
        }),
      );

      remoteCircuitDefs.forEach(([remoteLookup, circuitDefs]) => {
        if (!circuitDefs) {
          return;
        }

        const remoteCircuitUrl = $remotes[remoteLookup]!;

        Object.keys(circuitDefs).forEach((circuitLookup) => {
          ioc.Register(
            () => {
              return new RemoteRunnable({
                url: new URL(circuitLookup, remoteCircuitUrl).href,
              }).withConfig({ runName: `${remoteLookup}|${circuitLookup}` });
            },
            {
              Lazy: false,
              Name: `${remoteLookup}|${circuitLookup}`,
              Type: ioc.Symbol("Circuit"),
            },
          );

          // TODO(mcgear): Add a Tool around the circuit
          // TODO(mcgear): Add a Neuron around the tool
          // TODO(mcgear): Add a Neuron around the circuit
        });

        // TODO(mcgear): Add a Toolkit around the circuits
        // TODO(mcgear): Add a Neuron around the toolkit
      });
    }

    const circuitLookups = Object.keys(circuits || {});

    await Promise.all(
      circuitLookups.map(async (circuitLookup) => {
        const eacCircuit = circuits![circuitLookup]!;

        const circuitResolver = await ioc.Resolve<SynapticCircuitResolver>(
          ioc.Symbol("SynapticCircuitResolver"),
        );

        const circuitNeuron: EaCNeuron = await circuitResolver.Resolve(
          eacCircuit,
          ioc,
          eac,
        );

        if (circuitNeuron) {
          const resolveNeuron = (
            neuronLookup: string,
            neuron: EaCNeuronLike,
          ): Runnable => {
            return RunnableLambda.from(async () => {
              const neuronResolver = await ioc.Resolve<
                SynapticNeuronResolver<EaCNeuronLike>
              >(ioc.Symbol("SynapticNeuronResolver"));

              const runnable = await neuronResolver.Resolve(
                neuronLookup,
                neuron,
                ioc,
                eac,
              );

              return runnable;
            }).withConfig({
              runName: eacCircuit?.Details?.Name ?? "Circuit Neuron Resolver",
            });
          };

          const circuit = await resolveNeuron(circuitLookup, circuitNeuron);

          if (circuit) {
            ioc.Register(() => circuit, {
              Lazy: false,
              Name: circuitLookup,
              Type: ioc.Symbol("Circuit"),
            });
          }
        }
      }),
    );
  }

  protected configureEaCEmbeddings(
    eac: EverythingAsCodeSynaptic,
    ioc: IoCContainer,
  ): void {
    const aiLookups = Object.keys(eac!.AIs || {});

    aiLookups.forEach((aiLookup) => {
      const ai = eac!.AIs![aiLookup]!;

      const embeddingsLookups = Object.keys(ai.Embeddings || {});

      embeddingsLookups.forEach((embeddingsLookup) => {
        const embeddings = ai.Embeddings![embeddingsLookup]!;

        if (isEaCAzureOpenAIEmbeddingsDetails(embeddings.Details)) {
          const embeddingsDetails = embeddings
            .Details as EaCAzureOpenAIEmbeddingsDetails;

          ioc.Register(
            AzureOpenAIEmbeddings,
            () =>
              new AzureOpenAIEmbeddings({
                azureOpenAIApiInstanceName: embeddingsDetails.Instance,
                azureOpenAIApiEmbeddingsDeploymentName:
                  embeddingsDetails.DeploymentName,
                azureOpenAIApiKey: embeddingsDetails.APIKey,
                azureOpenAIApiVersion: embeddingsDetails.APIVersion ??
                  "2024-06-01",
              }),
            {
              Lazy: false,
              Name: `${aiLookup}|${embeddingsLookup}`,
              Type: ioc.Symbol(Embeddings.name),
            },
          );
        }
      });
    });
  }

  protected configureEaCIndexers(
    eac: EverythingAsCodeSynaptic,
    ioc: IoCContainer,
  ): void {
    const aiLookups = Object.keys(eac!.AIs || {});

    aiLookups.forEach((aiLookup) => {
      const ai = eac!.AIs![aiLookup]!;

      const indexerLookups = Object.keys(ai.Indexers || {});

      indexerLookups.forEach((indexerLookup) => {
        const indexer = ai.Indexers![indexerLookup]!;

        if (isEaCDenoKVIndexerDetails(indexer.Details)) {
          const idxDetails = indexer.Details as EaCDenoKVIndexerDetails;

          ioc.Register(
            async () =>
              new DenoKVRecordManager({
                KV: await ioc.Resolve(Deno.Kv, idxDetails.DenoKVDatabaseLookup),
                RootKey: idxDetails.RootKey,
              }),
            {
              Lazy: false,
              Name: `${aiLookup}|${indexerLookup}`,
              Type: ioc.Symbol("RecordManager"),
            },
          );
        }
      });
    });
  }

  protected configureEaCLLMs(
    eac: EverythingAsCodeSynaptic,
    ioc: IoCContainer,
  ): void {
    const aiLookups = Object.keys(eac!.AIs || {});

    aiLookups.forEach((aiLookup) => {
      const ai = eac!.AIs![aiLookup]!;

      const llmLookups = Object.keys(ai.LLMs || {});

      llmLookups.forEach((llmLookup) => {
        const llm = ai.LLMs![llmLookup]!;

        if (isEaCAzureOpenAILLMDetails(llm.Details)) {
          const llmDetails = llm.Details as EaCAzureOpenAILLMDetails;

          ioc.Register(
            AzureChatOpenAI,
            async (ioc) => {
              const llm = new AzureChatOpenAI({
                azureOpenAIApiDeploymentName: llmDetails.DeploymentName,
                azureOpenAIApiInstanceName: llmDetails.Instance,
                azureOpenAIApiKey: llmDetails.APIKey,
                azureOpenAIApiVersion: llmDetails.APIVersion ?? "2024-06-01",
                modelName: llmDetails.ModelName,
                temperature: 0.7,
                // maxTokens: 1000,
                maxRetries: 5,
                verbose: llmDetails.Verbose,
                streaming: llmDetails.Streaming,
                ...(llmDetails.InputParams || {}),
              });

              if (llmDetails.ToolLookups?.length) {
                const tools = await resolveTools(llmDetails.ToolLookups!, ioc);

                return llm.bindTools(
                  tools,
                  // llmDetails.ToolsAsFunctions
                  //   ?
                  // tools.map(formatToOpenAIFunction)
                  //   :
                  // tools.map(formatToOpenAITool)
                );
              }

              return llm;
            },
            {
              Lazy: false,
              Name: `${aiLookup}|${llmLookup}`,
              Type: ioc.Symbol(BaseLanguageModel.name),
            },
          );
        } else if (isEaCOpenAILLMDetails(llm.Details)) {
          const llmDetails = llm.Details as EaCOpenAILLMDetails;

          ioc.Register(
            ChatOpenAI,
            async (ioc) => {
              const llm = new ChatOpenAI({
                openAIApiKey: llmDetails.APIKey,
                modelName: llmDetails.ModelName,
                temperature: 0.7,
                streaming: llmDetails.Streaming,
                ...(llmDetails.InputParams || {}),
              });

              if (llmDetails.ToolLookups?.length) {
                const tools = await resolveTools(llmDetails.ToolLookups!, ioc);

                return llm.bindTools(
                  tools,
                  // llmDetails.ToolsAsFunctions
                  //   ?
                  // tools.map(formatToOpenAIFunction)
                  //   :
                  // tools.map(formatToOpenAITool)
                );
              }

              return llm;
            },
            {
              Lazy: false,
              Name: `${aiLookup}|${llmLookup}`,
              Type: ioc.Symbol(BaseLanguageModel.name),
            },
          );
        } else if (isEaCWatsonXLLMDetails(llm.Details)) {
          const llmDetails = llm.Details as EaCWatsonXLLMDetails;

          ioc.Register(
            WatsonxAI,
            () =>
              new WatsonxAI({
                ibmCloudApiKey: llmDetails.APIKey,
                projectId: llmDetails.ProjectID,
                modelId: llmDetails.ModelID,
                modelParameters: llmDetails.ModelParameters ?? {},
                verbose: llmDetails.Verbose,
              }),
            {
              Lazy: false,
              Name: `${aiLookup}|${llmLookup}`,
              Type: ioc.Symbol(BaseLanguageModel.name),
            },
          );
        }
      });
    });
  }

  protected configureEaCLoaders(
    eac: EverythingAsCodeSynaptic,
    ioc: IoCContainer,
  ): void {
    const aiLookups = Object.keys(eac!.AIs || {});

    // const deferRegister: (() => Promise<void>)[] = [];

    aiLookups.forEach((aiLookup) => {
      const ai = eac!.AIs![aiLookup]!;

      const loaderLookups = Object.keys(ai.Loaders || {});

      loaderLookups.forEach((loaderLookup) => {
        const loader = ai.Loaders![loaderLookup]!;

        if (isEaCCheerioWebDocumentLoaderDetails(loader.Details)) {
          const details = loader.Details as EaCCheerioWebDocumentLoaderDetails;

          ioc.Register(() => new CheerioWebBaseLoader(details.URL), {
            Lazy: false,
            Name: `${aiLookup}|${loaderLookup}`,
            Type: ioc.Symbol("DocumentLoader"),
          });
        } else if (isEaCDFSDocumentLoaderDetails(loader.Details)) {
          const details = loader.Details as EaCDFSDocumentLoaderDetails;

          ioc.Register(
            () => {
              return {
                load: async () => {
                  const dfs = eac.DFSs![details.DFSLookup]!.Details!;

                  const dfsHandler = await this.dfsHandlerResolver!.Resolve(
                    ioc,
                    details.DFSLookup,
                    dfs,
                  );

                  const loadedDocs = await Promise.all(
                    details.Documents.map(async (doc) => {
                      const file = await dfsHandler?.GetFileInfo(doc, "0");

                      let innerLoader: BaseDocumentLoader | undefined =
                        undefined;

                      if (
                        file &&
                        this.pdfLoaderFactory &&
                        doc.endsWith(".pdf")
                      ) {
                        innerLoader = this.pdfLoaderFactory(
                          await toBlob(file.Contents),
                        );
                        // innerLoader = new PDFLoader(
                        //   await toBlob(file.Contents)
                        // );
                      }

                      const docs = innerLoader ? await innerLoader.load() : [];

                      // const docs: any[] = [];

                      return docs.map((d) => {
                        return {
                          ...d,
                          metadata: {
                            ...(d.metadata || {}),
                            source: `${details.DFSLookup}://${doc}`,
                          },
                        };
                      });
                      // return file
                      //   ? ({
                      //       pageContent: await toText(file?.Contents!),
                      //       metadata: {
                      //         source: `${details.DFSLookup}://${doc}`,
                      //       },
                      //     } as Document)
                      //   : undefined;
                    }),
                  );

                  return loadedDocs
                    .filter((ld) => ld)
                    .flatMap((ld) => ld)
                    .filter((ld) => ld);
                },
              };
            },
            {
              Lazy: false,
              Name: `${aiLookup}|${loaderLookup}`,
              Type: ioc.Symbol("DocumentLoader"),
            },
          );
        } else if (isEaCCompoundDocumentLoaderDetails(loader.Details)) {
          const details = loader.Details as EaCCompoundDocumentLoaderDetails;

          ioc.Register(
            () => {
              return {
                async load() {
                  const loadedDocs = (
                    await Promise.all(
                      details.LoaderLookups.map(async (loaderLookup) => {
                        const loader = await ioc.Resolve<BaseDocumentLoader>(
                          ioc.Symbol("DocumentLoader"),
                          loaderLookup,
                        );

                        return await loader.load();
                      }),
                    )
                  ).flatMap((l) => l);

                  return loadedDocs;
                },
              };
            },
            {
              Lazy: false,
              Name: `${aiLookup}|${loaderLookup}`,
              Type: ioc.Symbol("DocumentLoader"),
            },
          );
        } else if (isEaCSchemaDocumentLoaderDetails(loader.Details)) {
          const details = loader.Details as EaCSchemaDocumentLoaderDetails;

          ioc.Register(
            () => {
              return {
                async load() {
                  // Step 1: Structure in-memory data into an array of JSON objects
                  const data = Object.entries(details.Schemas).map(
                    ([name, schema]) => ({
                      name,
                      schema,
                    }),
                  );

                  // Step 2: Serialize and blobify the JSON array
                  const jsonText = JSON.stringify(data, null, 2);
                  const blob = new Blob([jsonText], {
                    type: "application/json",
                  });

                  // Step 3: Use JSONLoader with pointer to extract /schema
                  const loader = new JSONLoader(blob, ["/schema"]);

                  // Step 4: Load the documents
                  const docs = await loader.load();

                  // Step 5: Add metadata if needed
                  return docs.map((doc, i) => ({
                    ...doc,
                    metadata: {
                      ...(doc.metadata || {}),
                      source: `schema://${data[i]?.name ?? "unknown"}`,
                    },
                  }));
                },
              };
            },
            {
              Lazy: false,
              Name: `${aiLookup}|${loaderLookup}`,
              Type: ioc.Symbol("DocumentLoader"),
            },
          );
        }
      });
    });
  }

  protected configureEaCPersistence(
    eac: EverythingAsCodeSynaptic,
    ioc: IoCContainer,
  ): void {
    const aiLookups = Object.keys(eac!.AIs || {});

    aiLookups.forEach((aiLookup) => {
      const ai = eac!.AIs![aiLookup]!;

      const persistenceLookups = Object.keys(ai.Persistence || {});

      persistenceLookups.forEach((persistenceLookup) => {
        const persistence = ai.Persistence![persistenceLookup]!;

        const details = persistence.Details;

        if (isEaCMemorySaverPersistenceDetails(details)) {
          ioc.Register(() => new MemorySaver(), {
            Lazy: false,
            Name: `${aiLookup}|${persistenceLookup}`,
            Type: ioc.Symbol("Persistence"),
          });
        } else if (isEaCDenoKVSaverPersistenceDetails(details)) {
          ioc.Register(
            async () => {
              const kv = await ioc.Resolve(Deno.Kv, details.DatabaseLookup);

              return new DenoKVSaver(
                kv,
                details.RootKey,
                details.CheckpointTTL,
              );
            },
            {
              Lazy: false,
              Name: `${aiLookup}|${persistenceLookup}`,
              Type: ioc.Symbol("Persistence"),
            },
          );
        }
      });
    });
  }

  protected configureEaCPersonalities(
    eac: EverythingAsCodeSynaptic,
    ioc: IoCContainer,
  ): void {
    const aiLookups = Object.keys(eac!.AIs || {});

    aiLookups.forEach((aiLookup) => {
      const ai = eac!.AIs![aiLookup]!;

      const personalityLookups = Object.keys(ai.Personalities || {});

      const attachPersonality = (
        resultDetails: EaCPersonalityDetails,
        lookup: string,
      ): EaCPersonalityDetails => {
        let [personalityAILookup, personalityLookup] = lookup.split("|");

        if (!personalityLookup) {
          personalityLookup = personalityAILookup;

          personalityAILookup = "";
        }

        const personality = (
          !personalityAILookup ? ai : eac!.AIs![personalityAILookup]
        )!.Personalities![personalityLookup]!;

        let details: EaCPersonalityDetails = mergeWithArrays(
          {
            SystemMessages: personality.Details?.SystemMessages ?? [],
            Instructions: personality.Details?.Instructions ?? [],
            Messages: personality.Details?.Messages ?? [],
            NewMessages: personality.Details?.NewMessages ?? [],
          } as EaCPersonalityDetails,
          resultDetails,
        );

        details = [...(personality.PersonalityLookups || [])]
          .reverse()
          .reduce((acc, next) => {
            return attachPersonality(acc, next);
          }, details);

        return details;
      };

      personalityLookups.forEach((personalityLookup) => {
        let resultDetails: EaCPersonalityDetails = {
          SystemMessages: [],
          Instructions: [],
          Messages: [],
          NewMessages: [],
        };

        resultDetails = attachPersonality(resultDetails, personalityLookup);

        ioc.Register(() => resultDetails, {
          Lazy: false,
          Name: `${aiLookup}|${personalityLookup}`,
          Type: ioc.Symbol("Personality"),
        });
      });
    });
  }

  protected async configureEaCRetrievers(
    eac: EverythingAsCodeSynaptic,
    ioc: IoCContainer,
  ): Promise<void> {
    const aiLookups = Object.keys(eac!.AIs || {});

    await Promise.all(
      aiLookups.map(async (aiLookup) => {
        const ai = eac!.AIs![aiLookup]!;

        const retrieverLookups = Object.keys(ai.Retrievers || {});

        await Promise.all(
          retrieverLookups.map(async (retrieverLookup) => {
            const retriever = ai.Retrievers![retrieverLookup]!;

            const vectorStore = await ioc.Resolve<VectorStore>(
              ioc.Symbol(VectorStore.name),
              retriever.Details!.VectorStoreLookup,
            );

            await ioc.Register(() => vectorStore.asRetriever(), {
              Lazy: false,
              Name: `${aiLookup}|${retrieverLookup}`,
              Type: ioc.Symbol("Retriever"),
            });

            if (retriever.Details!.RefreshOnStart) {
              await loadRetrieverDocs(
                ioc,
                retrieverLookup,
                retriever,
                vectorStore,
              );
            }
          }),
        );
      }),
    );
  }

  protected configureEaCTextSplitters(
    eac: EverythingAsCodeSynaptic,
    ioc: IoCContainer,
  ): void {
    const aiLookups = Object.keys(eac!.AIs || {});

    aiLookups.forEach((aiLookup) => {
      const ai = eac!.AIs![aiLookup]!;

      const textSplitterLookups = Object.keys(ai.TextSplitters || {});

      textSplitterLookups.forEach((textSplitterLookup) => {
        const eacTxtSplitter = ai.TextSplitters![textSplitterLookup]!;

        let textSplitter: Runnable | undefined;

        if (
          isEaCRecursiveCharacterTextSplitterDetails(eacTxtSplitter.Details)
        ) {
          const details = eacTxtSplitter
            .Details as EaCRecursiveCharacterTextSplitterDetails;

          textSplitter = (details.FromLanguage
            ? RecursiveCharacterTextSplitter.fromLanguage(details.FromLanguage)
            : new RecursiveCharacterTextSplitter({
              chunkOverlap: details.ChunkOverlap,
              chunkSize: details.ChunkSize,
              separators: details.Separators,
            })) as unknown as Runnable;
        }

        if (textSplitter) {
          if (eacTxtSplitter.Details?.TransformerLookup) {
            if (eacTxtSplitter.Details!.TransformerLookup === "HtmlToText") {
              textSplitter = textSplitter.pipe(
                new HtmlToTextTransformer() as any,
              );
            }
          }

          ioc.Register(() => textSplitter, {
            Lazy: false,
            Name: `${aiLookup}|${textSplitterLookup}`,
            Type: ioc.Symbol(TextSplitter.name),
          });
        }
      });
    });
  }

  protected configureEaCTools(
    eac: EverythingAsCodeSynaptic,
    ioc: IoCContainer,
  ): void {
    const aiLookups = Object.keys(eac!.AIs || {});

    aiLookups.forEach((aiLookup) => {
      const ai = eac!.AIs![aiLookup]!;

      const toolLookups = Object.keys(ai.Tools || {});

      toolLookups.forEach((toolLookup) => {
        const tool = ai.Tools![toolLookup]!;

        const details = tool.Details;

        if (isEaCSERPToolDetails(details)) {
          ioc.Register(
            () => {
              return new SerpAPI(details.APIKey);
            },
            {
              Lazy: false,
              Name: `${aiLookup}|${toolLookup}`,
              Type: ioc.Symbol("Tool"),
            },
          );
        } else if (isEaCTavilySearchResultsToolDetails(details)) {
          ioc.Register(
            () => {
              return new TavilySearchResults({
                apiKey: details.APIKey,
              });
            },
            {
              Lazy: false,
              Name: `${aiLookup}|${toolLookup}`,
              Type: ioc.Symbol("Tool"),
            },
          );
        } else if (isEaCDynamicToolDetails(details)) {
          ioc.Register(
            () => {
              return details.Schema
                ? new DynamicStructuredTool({
                  name: details.Name,
                  description: details.Description,
                  schema: details.Schema as z.ZodObject<any>,
                  func: details.Action || (() => Promise.resolve("")),
                })
                : new DynamicTool({
                  name: details.Name,
                  description: details.Description,
                  func: details.Action || (() => Promise.resolve("")),
                });
            },
            {
              Lazy: false,
              Name: `${aiLookup}|${toolLookup}`,
              Type: ioc.Symbol("Tool"),
            },
          );
        } else if (isEaCCircuitToolDetails(details)) {
          ioc.Register(
            () => {
              const eacCircuit = eac.Circuits![details.CircuitLookup]!;

              const inputSchema = eacCircuit!.Details!.InputSchema;

              return inputSchema
                ? new DynamicStructuredTool({
                  name: eacCircuit!.Details!.Name!,
                  description: eacCircuit!.Details!.Description!,
                  schema: inputSchema as ZodObject<any>,
                  func: async (
                    input: z.infer<typeof inputSchema>,
                    _runMgr,
                    config,
                  ) => {
                    const circuit = await ioc.Resolve<Runnable>(
                      ioc.Symbol("Circuit"),
                      details.CircuitLookup,
                    );

                    return await circuit.invoke(input, config);
                  },
                })
                : new DynamicTool({
                  name: eacCircuit!.Details!.Name!,
                  description: eacCircuit!.Details!.Description!,
                  func: async (input: any, _runMgr, config) => {
                    const circuit = await ioc.Resolve<Runnable>(
                      ioc.Symbol("Circuit"),
                      details.CircuitLookup,
                    );

                    return await circuit.invoke(input, config);
                  },
                });
            },
            {
              Lazy: false,
              Name: `${aiLookup}|${toolLookup}`,
              Type: ioc.Symbol("Tool"),
            },
          );
        } else if (isEaCRemoteCircuitsToolDetails(details)) {
          ioc.Register(
            async () => {
              const resp = await fetch(details.URL);

              const circuits = await resp.json();

              return new RemoteCircuitsToolkit(details.URL, circuits);
            },
            {
              Lazy: false,
              Name: `${aiLookup}|${toolLookup}`,
              Type: ioc.Symbol("Tool"),
            },
          );
        }
      });
    });
  }

  protected async configureEaCVectorStores(
    eac: EverythingAsCodeSynaptic,
    ioc: IoCContainer,
  ): Promise<void> {
    const aiLookups = Object.keys(eac!.AIs || {});

    const calls = aiLookups.map(async (aiLookup) => {
      const ai = eac!.AIs![aiLookup]!;

      const vectorStoreLookups = Object.keys(ai.VectorStores || {});

      const vectorStoreCalls = vectorStoreLookups.map(
        async (vectorStoreLookup) => {
          const vectorStore = ai.VectorStores![vectorStoreLookup]!;

          const embeddings = await ioc.Resolve<Embeddings>(
            ioc.Symbol(Embeddings.name),
            vectorStore.Details!.EmbeddingsLookup,
          );

          if (isEaCAzureSearchAIVectorStoreDetails(vectorStore.Details)) {
            const vectorStoreDetails = vectorStore
              .Details as EaCAzureSearchAIVectorStoreDetails;

            ioc.Register(
              () => {
                return new AzureAISearchVectorStore(embeddings, {
                  endpoint: vectorStoreDetails.Endpoint,
                  key: vectorStoreDetails.APIKey,
                  indexName: vectorStoreDetails.IndexName,
                  search: {
                    type: vectorStoreDetails.QueryType,
                  },
                });
              },
              {
                Lazy: false,
                Name: `${aiLookup}|${vectorStoreLookup}`,
                Type: ioc.Symbol(VectorStore.name),
              },
            );
          } else if (isEaCHNSWVectorStoreDetails(vectorStore.Details)) {
            const vectorStoreDetails = vectorStore
              .Details as EaCHNSWVectorStoreDetails;

            ioc.Register(
              () =>
                new HNSWLib(embeddings, {
                  space: vectorStoreDetails.Space,
                }),
              {
                Lazy: false,
                Name: `${aiLookup}|${vectorStoreLookup}`,
                Type: ioc.Symbol(VectorStore.name),
              },
            );
          } else if (isEaCMemoryVectorStoreDetails(vectorStore.Details)) {
            ioc.Register(() => new MemoryVectorStore(embeddings), {
              Lazy: false,
              Name: `${aiLookup}|${vectorStoreLookup}`,
              Type: ioc.Symbol(VectorStore.name),
            });
          }
        },
      );

      await Promise.all(vectorStoreCalls);
    });

    await Promise.all(calls);
  }

  protected async configureEaCSynaptic(
    eac: EverythingAsCodeSynaptic,
    ioc: IoCContainer,
  ): Promise<void> {
    this.configureEaCPersonalities(eac, ioc);

    this.configureEaCTools(eac, ioc);

    this.configureEaCEmbeddings(eac, ioc);

    this.configureEaCLLMs(eac, ioc);

    await this.configureEaCVectorStores(eac, ioc);

    this.configureEaCIndexers(eac, ioc);

    this.configureEaCLoaders(eac, ioc);

    this.configureEaCTextSplitters(eac, ioc);

    this.configureEaCChatHistories(eac, ioc);

    await this.configureEaCRetrievers(eac, ioc);

    this.configureEaCPersistence(eac, ioc);

    await this.configureEaCSynapticHandlers(eac, ioc);

    await this.configureEaCCircuits(eac, ioc);
  }

  protected async configureEaCSynapticHandlers(
    eac: EverythingAsCodeSynaptic,
    ioc: IoCContainer,
  ): Promise<void> {
    const logger = await ioc.Resolve(LoggingProvider);

    if (eac.Circuits) {
      const handlerDFSLookups = eac.Circuits.$resolvers || [];

      if (!eac.Circuits?.$resolvers?.length) {
        handlerDFSLookups.push("$resolvers");
      }

      const dfsFilePaths = (
        await Promise.all(
          handlerDFSLookups?.map(async (dfsLookup) => {
            const dfs = dfsLookup === "$resolvers"
              ? this.isLocal
                ? ({
                  Type: "Local",
                  FileRoot: import.meta
                    .resolve("../resolvers")
                    .replace("file:///", ""),
                  Extensions: ["resolver.ts"],
                  // WorkerPath: import.meta.resolve(
                  //   "@fathym/eac/dfs/workers/local",
                  // ),
                } as EaCLocalDistributedFileSystemDetails)
                : ({
                  Type: "JSR",
                  Package: "@fathym/synaptic",
                  Version: "",
                  // WorkerPath: import.meta.resolve(
                  //   "@fathym/eac/dfs/workers/jsr",
                  // ),
                } as EaCJSRDistributedFileSystemDetails)
              : eac.DFSs![dfsLookup]!.Details!;

            const dfsHandler = await this.dfsHandlerResolver!.Resolve(
              ioc,
              dfsLookup,
              dfs,
              eac.$GlobalOptions?.DFSs || {},
            );

            return {
              dfsLookup,
              dfs,
              fileHandler: dfsHandler,
              paths: await dfsHandler?.LoadAllPaths(Date.now().toString()),
            };
          }),
        )
      )
        .filter((s) => !!s?.fileHandler)
        .map((s) => {
          return {
            dfsLookup: s.dfsLookup,
            dfs: s.dfs,
            fileHandler: s.fileHandler!,
            paths: s.paths,
          };
        });

      await Promise.all(
        dfsFilePaths.map(async ({ dfsLookup, dfs, fileHandler, paths }) => {
          const fileModules = (
            await Promise.all(
              paths
                // TODO(mcgear): Make extensions configurable... Maybe all DFSs should have an extensions options to trim them down
                ?.filter((p) => p.endsWith("ts") || p.endsWith("tsx"))
                .map(async (path) => {
                  const module = await importDFSTypescriptModule(
                    logger.Package,
                    fileHandler,
                    path,
                    dfs,
                    dfsLookup,
                    "ts",
                  );

                  return module;
                }) || [],
            )
          )
            .filter((m) => !!m?.module?.SynapticResolverConfig)
            .map((m) => m!);

          fileModules.forEach((module) => {
            const config: SynapticResolverConfiguration =
              module.module.SynapticResolverConfig;

            if (config.Type === "neuron") {
              const resolver: SynapticNeuronResolver<EaCNeuron> =
                module.module.default;

              ioc.Register(() => resolver, {
                Name: config.Name,
                Type: ioc.Symbol("SynapticNeuronResolver"),
              });
            } else if (config.Type === "circuit") {
              const resolver: SynapticCircuitResolver = module.module.default;

              ioc.Register(() => resolver, {
                Name: config.Name,
                Type: ioc.Symbol("SynapticCircuitResolver"),
              });
            }
          });
        }),
      );
    }
  }
}

export async function resolveTools<
  TTool = StructuredTool<ZodObject<any, any, any, any, { [x: string]: any }>>,
>(toolLookups: string[], ioc: IoCContainer): Promise<TTool[]> {
  const tools = await Promise.all(
    toolLookups.map(async (toolLookup): Promise<TTool[]> => {
      const tool = await ioc.Resolve<any>(ioc.Symbol("Tool"), toolLookup);

      if ("getTools" in tool) {
        return tool.getTools();
      } else {
        return [tool];
      }
    }),
  );

  return tools.flatMap((t) => t);
}

export type RemoteCircuitDefinition = {
  Description: string;

  InputSchema: any;

  Name: string;
};

export class RemoteCircuitsToolkit extends Toolkit {
  tools: Toolkit["tools"];

  constructor(
    protected circuitsUrl: string,
    protected circuits: Record<string, RemoteCircuitDefinition>,
  ) {
    super();

    this.tools = [];
  }

  public override getTools(): ReturnType<Toolkit["getTools"]> {
    return Object.keys(this.circuits).map((circuitLookup) => {
      const circuitDef = this.circuits[circuitLookup];

      const inputSchemaStr = jsonSchemaToZod(circuitDef.InputSchema);

      const inputSchema = eval(inputSchemaStr) as z.ZodObject<any>;

      const circuit = new RemoteRunnable<unknown, string, RunnableConfig>({
        url: new URL(circuitLookup, this.circuitsUrl).href,
      });

      const tool = inputSchema
        ? new DynamicStructuredTool({
          name: circuitDef.Name!,
          description: circuitDef.Description!,
          schema: inputSchema,
          func: async (
            input: z.infer<typeof inputSchema>,
            _runMgr,
            config,
          ) => {
            return await circuit.invoke(input, config);
          },
        })
        : new DynamicTool({
          name: circuitDef.Name!,
          description: circuitDef.Description!,
          func: async (input: any, _runMgr, config) => {
            return await circuit.invoke(input, config);
          },
        });

      return tool as StructuredToolInterface;
    }) as any;
  }
}
