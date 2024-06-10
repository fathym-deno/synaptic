// deno-lint-ignore-file no-explicit-any
import "npm:cheerio";
import {
  AzureAISearchVectorStore,
  AzureChatOpenAI,
  AzureOpenAIEmbeddings,
  BaseDocumentLoader,
  BaseLanguageModel,
  BaseListChatMessageHistory,
  BaseMessage,
  BaseMessagePromptTemplateLike,
  BasePromptTemplate,
  ChatPromptTemplate,
  CheerioWebBaseLoader,
  convertToOpenAIFunction,
  convertToOpenAITool,
  createStuffDocumentsChain,
  DynamicStructuredTool,
  EaCAzureOpenAIEmbeddingsDetails,
  EaCAzureOpenAILLMDetails,
  EaCDenoKVChatHistoryDetails,
  EaCRuntimeConfig,
  EaCRuntimePlugin,
  EaCRuntimePluginConfig,
  EaCWatsonXLLMDetails,
  Embeddings,
  FunctionMessage,
  HNSWLib,
  index,
  IoCContainer,
  isEaCAzureOpenAIEmbeddingsDetails,
  isEaCAzureOpenAILLMDetails,
  isEaCDenoKVChatHistoryDetails,
  isEaCWatsonXLLMDetails,
  LanguageModelLike,
  MemorySaver,
  MemoryVectorStore,
  merge,
  MessageGraph,
  PromptTemplate,
  RecordManagerInterface,
  RecursiveCharacterTextSplitter,
  Runnable,
  RunnableConfig,
  RunnableLambda,
  RunnableLike,
  RunnableMap,
  RunnablePassthrough,
  RunnableWithMessageHistory,
  SerpAPI,
  StateGraph,
  StateGraphArgs,
  StringOutputParser,
  TavilySearchResults,
  TextSplitter,
  Tool,
  ToolExecutor,
  ToolInvocationInterface,
  ToolMessage,
  ToolNode,
  VectorStore,
  WatsonxAI,
} from '../src.deps.ts';
import {
  EaCHNSWVectorStoreDetails,
  isEaCHNSWVectorStoreDetails,
} from "../eac/EaCHNSWVectorStoreDetails.ts";
import {
  EaCMemoryVectorStoreDetails,
  isEaCMemoryVectorStoreDetails,
} from "../eac/EaCMemoryVectorStoreDetails.ts";
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
import { EaCNeuron, EaCNeuronLike, isEaCNeuron } from "../eac/EaCNeuron.ts";
import { isEaCLLMNeuron } from "../eac/neurons/EaCLLMNeuron.ts";
import { isEaCPromptNeuron } from "../eac/neurons/EaCPromptNeuron.ts";
import { isEaCChatPromptNeuron } from "../eac/neurons/EaCChatPromptNeuron.ts";
import {
  EaCChatHistoryNeuron,
  isEaCChatHistoryNeuron,
} from "../eac/neurons/EaCChatHistoryNeuron.ts";
import { isEaCCircuitDetails } from "../eac/EaCCircuitDetails.ts";
import {
  EaCRecursiveCharacterTextSplitterDetails,
  isEaCRecursiveCharacterTextSplitterDetails,
} from "../eac/EaCRecursiveCharacterTextSplitterDetails.ts";
import { isEaCStuffDocumentsNeuron } from "../eac/neurons/EaCStuffDocumentsNeuron.ts";
import { isEaCLinearCircuitDetails } from "../eac/EaCLinearCircuitDetails.ts";
import {
  EaCGraphCircuitDetails,
  EaCGraphCircuitEdge,
  EaCGraphCircuitEdgeLike,
  isEaCGraphCircuitDetails,
} from "../eac/EaCGraphCircuitDetails.ts";
import { isEaCCircuitNeuron } from "../eac/neurons/EaCCircuitNeuron.ts";
import {
  EaCSERPToolDetails,
  isEaCSERPToolDetails,
} from "../eac/tools/EaCSERPToolDetails.ts";
import { isEaCToolNeuron } from "../eac/neurons/EaCToolNeuron.ts";
import { isEaCStringOutputParserNeuron } from "../eac/neurons/EaCStringOutputParserNeuron.ts";
import { isEaCTavilySearchResultsToolDetails } from "../eac/tools/EaCTavilySearchResultsToolDetails.ts";
import { isEaCPassthroughNeuron } from "../eac/neurons/EaCPassthroughNeuron.ts";
import { isEaCToolExecutorNeuron } from "../eac/neurons/EaCToolExecutorNeuron.ts";
import { isEaCDynamicStructuredToolDetails } from "../eac/tools/EaCDynamicStructuredToolDetails.ts";
import { isEaCToolNodeNeuron } from "../eac/neurons/EaCToolNodeNeuron.ts";

import jsonpath from "https://cdn.skypack.dev/jsonpath";

export class JSONPathRunnablePassthrough<
  RunInput = any,
> extends RunnablePassthrough<RunInput> {
  constructor(protected jsonPath: string) {
    super();
  }

  async invoke(
    input: RunInput,
    options?: Partial<RunnableConfig>,
  ): Promise<RunInput> {
    input = this.jsonPath ? jsonpath.query(input, this.jsonPath)[0] : input;

    return super.invoke(input, options);
  }
}

export default class FathymSynapticEaCServicesPlugin
  implements EaCRuntimePlugin {
  public async AfterEaCResolved(
    eac: EverythingAsCodeSynaptic,
    ioc: IoCContainer,
  ): Promise<void> {
    await this.configureEaCSynaptic(eac, ioc);
  }

  public Setup(_config: EaCRuntimeConfig): Promise<EaCRuntimePluginConfig> {
    const pluginConfig: EaCRuntimePluginConfig = {
      Name: "FathymSynapticEaCServicesPlugin",
    };

    return Promise.resolve(pluginConfig);
  }

  protected configureEaCChatHistories(
    eac: EverythingAsCodeSynaptic,
    ioc: IoCContainer,
  ): void {
    const aiLookups = Object.keys(eac!.AIs || {});

    aiLookups.forEach((aiLookup) => {
      const ai = eac!.AIs![aiLookup];

      const chatHistoryLookups = Object.keys(ai.ChatHistories || {});

      chatHistoryLookups.forEach((chatHistoryLookup) => {
        const chatHistory = ai.ChatHistories![chatHistoryLookup];

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

  protected configureEaCCircuits(
    eac: EverythingAsCodeSynaptic,
    ioc: IoCContainer,
  ): void {
    const circuitLookups = Object.keys(eac.Circuits || {});

    const resolveNeuron = async (neuron: EaCNeuronLike): Promise<Runnable> => {
      let runnable: Runnable = new RunnablePassthrough();

      if (neuron) {
        if (typeof neuron === "string") {
          neuron = eac.Circuits!.$neurons![neuron];
        } else if (Array.isArray(neuron)) {
          const [neoronLookup, neuronOverride] = neuron as [string, EaCNeuron];

          neuron = eac.Circuits!.$neurons![neoronLookup];

          neuron = merge(neuron, neuronOverride);
        }

        neuron = neuron as EaCNeuron;

        if (isEaCNeuron(neuron.Type, neuron)) {
          if (isEaCLLMNeuron(neuron)) {
            const llm = await ioc.Resolve<BaseLanguageModel>(
              ioc.Symbol(BaseLanguageModel.name),
              neuron.LLMLookup,
            );

            runnable = llm;
          } else if (isEaCPromptNeuron(neuron)) {
            const prompt = PromptTemplate.fromTemplate(neuron.PromptTemplate);

            runnable = prompt;
          } else if (isEaCChatPromptNeuron(neuron)) {
            const messages: BaseMessagePromptTemplateLike[] = [];

            if (neuron.SystemMessage) {
              messages.push(["system", neuron.SystemMessage]);
            }

            if (neuron.Messages) {
              messages.push(...neuron.Messages);
            }

            if (neuron.NewMessages) {
              messages.push(...neuron.NewMessages);
            }

            const prompt = ChatPromptTemplate.fromMessages(messages);

            runnable = prompt;
          } else if (isEaCCircuitNeuron(neuron)) {
            const circuit = await ioc.Resolve<Runnable>(
              ioc.Symbol("Circuit"),
              neuron.CircuitLookup,
            );

            runnable = circuit;
          } else if (isEaCToolNeuron(neuron)) {
            const tool = await ioc.Resolve<Runnable>(
              ioc.Symbol("Tool"),
              neuron.ToolLookup,
            );

            runnable = tool;
          } else if (isEaCToolExecutorNeuron(neuron)) {
            const tools = await Promise.all(
              neuron.ToolLookups.map(async (toolLookup) => {
                return await ioc.Resolve<Tool>(ioc.Symbol("Tool"), toolLookup);
              }),
            );

            runnable = new ToolExecutor({ tools });

            const msgsPath = neuron.MessagesPath;

            if (msgsPath) {
              const origRunnable = runnable;

              runnable = RunnableLambda.from(async (state) => {
                const messages = jsonpath.query(
                  state,
                  msgsPath,
                )[0] as BaseMessage[];

                const lastMessage = messages[messages.length - 1];

                if (!lastMessage) {
                  throw new Error("No messages found.");
                }

                if (
                  !lastMessage.additional_kwargs.function_call &&
                  !lastMessage.additional_kwargs.tool_calls
                ) {
                  throw new Error("No function call found in message.");
                }

                const actions: (ToolInvocationInterface & {
                  callId?: string;
                })[] = [];

                if (lastMessage.additional_kwargs.function_call) {
                  actions.push({
                    tool: lastMessage.additional_kwargs.function_call.name,
                    toolInput: JSON.parse(
                      lastMessage.additional_kwargs.function_call.arguments,
                    ),
                  });
                } else if (lastMessage.additional_kwargs.tool_calls) {
                  actions.push(
                    ...lastMessage.additional_kwargs.tool_calls.map(
                      (toolCall) => {
                        return {
                          callId: toolCall.id,
                          tool: toolCall.function.name,
                          toolInput: JSON.parse(toolCall.function.arguments),
                        };
                      },
                    ),
                  );
                }

                const msgs = await Promise.all(
                  actions.map(async (action) => {
                    const response = await origRunnable.invoke(action);

                    if (lastMessage.additional_kwargs.tool_calls) {
                      return new ToolMessage({
                        tool_call_id: action.callId!,
                        content: response,
                        name: action.tool,
                      });
                    } else {
                      return new FunctionMessage({
                        content: response,
                        name: action.tool,
                      });
                    }
                  }),
                );

                return msgs;
              });
            }
          } else if (isEaCToolNodeNeuron(neuron)) {
            const tools = await Promise.all(
              neuron.ToolLookups.map(async (toolLookup) => {
                return await ioc.Resolve<Tool>(ioc.Symbol("Tool"), toolLookup);
              }),
            );

            runnable = new ToolNode(tools);
          } else if (isEaCStringOutputParserNeuron(neuron)) {
            runnable = new StringOutputParser();
          } else if (isEaCPassthroughNeuron(neuron)) {
            if (neuron.Field) {
              runnable = new JSONPathRunnablePassthrough(neuron.Field);
            }
          }

          const childRunnable = await resolveNeurons(neuron.Neurons);

          if (childRunnable) {
            if (isEaCChatHistoryNeuron(neuron)) {
              const getMessageHistory = await ioc.Resolve<
                (sessionId: string) => BaseListChatMessageHistory
              >(ioc.Symbol("ChatHistory"), neuron.ChatHistoryLookup);

              const rootMessages = neuron.Messages;

              runnable = new RunnableWithMessageHistory({
                runnable: childRunnable as Runnable,
                getMessageHistory: async (sessionId: string) => {
                  const chatHistory = getMessageHistory(sessionId);

                  const messages = await chatHistory.getMessages();

                  if (!messages.length) {
                    await chatHistory.addMessages(rootMessages || []);
                  }

                  return chatHistory;
                },
                inputMessagesKey: neuron.InputKey,
                historyMessagesKey: neuron.HistoryKey,
              });
            } else if (isEaCStuffDocumentsNeuron(neuron)) {
              runnable = (await createStuffDocumentsChain({
                llm: (await resolveNeuron(
                  neuron.LLMNeuron,
                )) as LanguageModelLike as any,
                prompt: childRunnable as BasePromptTemplate as any,
              })) as any;
            } else {
              runnable = runnable.pipe(childRunnable);
            }
          }

          if (neuron.Bootstrap) {
            runnable = await neuron.Bootstrap(runnable, neuron);
          }

          const synapses = await resolveNeurons(neuron.Synapses);

          if (synapses) {
            runnable = runnable ? runnable.pipe(synapses) : runnable;
          }
        }
      }

      return runnable;
    };

    const resolveNeurons = async (
      neurons?: Record<string, EaCNeuronLike>,
    ): Promise<Runnable | undefined> => {
      let runnable: Runnable | undefined = undefined;

      const neuronLookups = Object.keys(neurons || {});

      if (neurons && neuronLookups.length > 0) {
        if (neuronLookups.length === 1 && "" in neurons) {
          const neuron = neurons[""];

          runnable = await resolveNeuron(neuron);
        } else {
          type fromParams = Parameters<typeof RunnableMap.from>;

          type input = Parameters<typeof RunnableMap.from>;

          const runnables: fromParams[0] = {};

          for (const neuronLookup of neuronLookups) {
            const neuron = neurons[neuronLookup];

            runnables[neuronLookup] = await resolveNeuron(neuron);
          }

          runnable = RunnableMap.from(runnables);
        }
      }

      return runnable;
    };

    circuitLookups.forEach((circuitLookup) => {
      const eacCircuit = eac.Circuits![circuitLookup];

      if (isEaCGraphCircuitDetails(eacCircuit.Details)) {
        const details = eacCircuit.Details as EaCGraphCircuitDetails;

        ioc.Register(
          async () => {
            let graph = details.State
              ? new StateGraph({
                channels: details.State as StateGraphArgs<unknown>["channels"],
              })
              : new MessageGraph();

            const neuronLookups = Object.keys(details.Neurons ?? {});

            const nodes = await Promise.all(
              neuronLookups.map(async (neuronLookup) => {
                const runnable = await resolveNeurons({
                  "": details.Neurons![neuronLookup],
                });

                return [neuronLookup, runnable!] as [string, RunnableLike];
              }),
            );

            nodes.forEach(([neuronLookup, runnable]) => {
              graph = graph.addNode(neuronLookup, runnable as any) as any;
            });

            const edgeNodeLookups = Object.keys(details.Edges ?? {});

            edgeNodeLookups.forEach((edgeNodeLookup) => {
              const edgeNode: EaCGraphCircuitEdgeLike =
                details.Edges![edgeNodeLookup];

              let edgeConfigs: EaCGraphCircuitEdge[] = [];

              if (typeof edgeNode === "string") {
                edgeConfigs.push({
                  Node: edgeNode,
                });
              } else if (!Array.isArray(edgeNode)) {
                edgeConfigs.push(edgeNode as EaCGraphCircuitEdge);
              } else {
                const workingNodes = edgeNode as (
                  | string
                  | EaCGraphCircuitEdge
                )[];

                workingNodes.forEach((node) => {
                  if (typeof node === "string") {
                    edgeConfigs.push({
                      Node: node,
                    });
                  } else if (!Array.isArray(node)) {
                    edgeConfigs.push(node as EaCGraphCircuitEdge);
                  }
                });
              }

              edgeConfigs.forEach((config) => {
                if (typeof config.Node === "string") {
                  graph.addEdge(edgeNodeLookup as any, config.Node as any);
                } else {
                  graph.addConditionalEdges(
                    edgeNodeLookup as any,
                    config.Condition as any,
                    config.Node as any,
                  );
                }
              });
            });

            const circuit = graph.compile({
              checkpointer: new MemorySaver(),
              interruptAfter: details.Interrupts?.After as any,
              interruptBefore: details.Interrupts?.Before as any,
            });

            return circuit;
          },
          {
            Lazy: false,
            Name: circuitLookup,
            Type: ioc.Symbol("Circuit"),
          },
        );
      } else if (
        isEaCLinearCircuitDetails(eacCircuit.Details) ||
        isEaCCircuitDetails(undefined, eacCircuit.Details)
      ) {
        ioc.Register(
          async () => {
            let circuit = await resolveNeurons(eacCircuit.Details!.Neurons);

            const synapses = await resolveNeurons(eacCircuit.Details!.Synapses);

            if (synapses) {
              circuit = circuit ? circuit.pipe(synapses) : synapses;
            }

            return circuit;
          },
          {
            Lazy: false,
            Name: circuitLookup,
            Type: ioc.Symbol("Circuit"),
          },
        );
      }
    });
  }

  protected configureEaCEmbeddings(
    eac: EverythingAsCodeSynaptic,
    ioc: IoCContainer,
  ): void {
    const aiLookups = Object.keys(eac!.AIs || {});

    aiLookups.forEach((aiLookup) => {
      const ai = eac!.AIs![aiLookup];

      const embeddingsLookups = Object.keys(ai.Embeddings || {});

      embeddingsLookups.forEach((embeddingsLookup) => {
        const embeddings = ai.Embeddings![embeddingsLookup];

        if (isEaCAzureOpenAIEmbeddingsDetails(embeddings.Details)) {
          const embeddingsDetails = embeddings
            .Details as EaCAzureOpenAIEmbeddingsDetails;

          ioc.Register(
            AzureOpenAIEmbeddings,
            () =>
              new AzureOpenAIEmbeddings({
                azureOpenAIEndpoint: embeddingsDetails.Endpoint,
                azureOpenAIApiKey: embeddingsDetails.APIKey,
                azureOpenAIEmbeddingsApiDeploymentName:
                  embeddingsDetails.DeploymentName,
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
      const ai = eac!.AIs![aiLookup];

      const indexerLookups = Object.keys(ai.Indexers || {});

      indexerLookups.forEach((indexerLookup) => {
        const indexer = ai.Indexers![indexerLookup];

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
      const ai = eac!.AIs![aiLookup];

      const llmLookups = Object.keys(ai.LLMs || {});

      llmLookups.forEach((llmLookup) => {
        const llm = ai.LLMs![llmLookup];

        if (isEaCAzureOpenAILLMDetails(llm.Details)) {
          const llmDetails = llm.Details as EaCAzureOpenAILLMDetails;

          ioc.Register(
            AzureChatOpenAI,
            async (ioc) => {
              const llm = new AzureChatOpenAI({
                azureOpenAIEndpoint: llmDetails.Endpoint,
                azureOpenAIApiKey: llmDetails.APIKey,
                azureOpenAIEmbeddingsApiDeploymentName:
                  llmDetails.DeploymentName,
                modelName: llmDetails.ModelName,
                temperature: 0.7,
                // maxTokens: 1000,
                maxRetries: 5,
                verbose: llmDetails.Verbose,
                streaming: llmDetails.Streaming,
                ...(llmDetails.InputParams || {}),
              });

              if (llmDetails.ToolLookups?.length) {
                const tools = await Promise.all(
                  llmDetails.ToolLookups.map(async (toolLookup) => {
                    return await ioc.Resolve<Tool>(
                      ioc.Symbol("Tool"),
                      toolLookup,
                    );
                  }),
                );

                return llm.bind({
                  functions: llmDetails.ToolsAsFunctions
                    ? tools.map(convertToOpenAIFunction)
                    : undefined,
                  tools: llmDetails.ToolsAsFunctions
                    ? undefined
                    : tools.map(convertToOpenAITool),
                });
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

    aiLookups.forEach((aiLookup) => {
      const ai = eac!.AIs![aiLookup];

      const loaderLookups = Object.keys(ai.Loaders || {});

      loaderLookups.forEach((loaderLookup) => {
        const loader = ai.Loaders![loaderLookup];

        if (isEaCCheerioWebDocumentLoaderDetails(loader.Details)) {
          const details = loader.Details as EaCCheerioWebDocumentLoaderDetails;

          ioc.Register(() => new CheerioWebBaseLoader(details.URL), {
            Lazy: false,
            Name: `${aiLookup}|${loaderLookup}`,
            Type: ioc.Symbol("DocumentLoader"),
          });
        }
      });
    });
  }

  protected async configureEaCRetrievers(
    eac: EverythingAsCodeSynaptic,
    ioc: IoCContainer,
  ): Promise<void> {
    const retrieverLookups = Object.keys(eac.Retrievers || {});

    const retrieverCalls = retrieverLookups.map(async (retrieverLookup) => {
      const retriever = eac.Retrievers![retrieverLookup];

      const loaderCalls = retriever.Details!.LoaderLookups.map(
        async (loaderLookup) => {
          const loader = await ioc.Resolve<BaseDocumentLoader>(
            ioc.Symbol("DocumentLoader"),
            loaderLookup,
          );

          const docs = await loader.load();

          return docs;
        },
      );

      const loadedDocs = await Promise.all(loaderCalls);

      const splitter = await ioc.Resolve<TextSplitter>(
        ioc.Symbol("TextSplitter"),
        retriever.Details!.TextSplitterLookup,
      );

      const splitDocs = await splitter.splitDocuments(
        loadedDocs.flatMap((ld) => ld),
      );

      const vectorStore = await ioc.Resolve<VectorStore>(
        ioc.Symbol(VectorStore.name),
        retriever.Details!.VectorStoreLookup,
      );

      if (retriever.Details!.IndexerLookup) {
        const recordManager = await ioc.Resolve<RecordManagerInterface>(
          ioc.Symbol("RecordManager"),
          retriever.Details!.IndexerLookup,
        );

        try {
          const idxRes = await index({
            docsSource: splitDocs,
            recordManager,
            vectorStore,
            options: {
              cleanup: "incremental",
              sourceIdKey: "source",
            },
          });

          console.log(idxRes);
        } catch (err) {
          console.error(err);

          throw err;
        }
      } else {
        await vectorStore.addDocuments(splitDocs);
      }
    });

    await Promise.all(retrieverCalls);
  }

  protected configureEaCTextSplitters(
    eac: EverythingAsCodeSynaptic,
    ioc: IoCContainer,
  ): void {
    const aiLookups = Object.keys(eac!.AIs || {});

    aiLookups.forEach((aiLookup) => {
      const ai = eac!.AIs![aiLookup];

      const textSplitterLookups = Object.keys(ai.TextSplitters || {});

      textSplitterLookups.forEach((textSplitterLookup) => {
        const txtSplitter = ai.TextSplitters![textSplitterLookup];

        if (isEaCRecursiveCharacterTextSplitterDetails(txtSplitter.Details)) {
          const details = txtSplitter
            .Details as EaCRecursiveCharacterTextSplitterDetails;

          ioc.Register(
            () =>
              new RecursiveCharacterTextSplitter({
                chunkOverlap: details.ChunkOverlap,
                chunkSize: details.ChunkSize,
                separators: details.Separators,
              }),
            {
              Lazy: false,
              Name: `${aiLookup}|${textSplitterLookup}`,
              Type: ioc.Symbol("TextSplitter"),
            },
          );
        }
      });
    });
  }

  protected async configureEaCTools(
    eac: EverythingAsCodeSynaptic,
    ioc: IoCContainer,
  ): Promise<void> {
    const aiLookups = Object.keys(eac!.AIs || {});

    const calls = aiLookups.map(async (aiLookup) => {
      const ai = eac!.AIs![aiLookup];

      const toolLookups = Object.keys(ai.Tools || {});

      const toolCalls = toolLookups.map(async (toolLookup) => {
        const tool = ai.Tools![toolLookup];

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
        } else if (isEaCDynamicStructuredToolDetails(details)) {
          ioc.Register(
            () => {
              return new DynamicStructuredTool({
                name: details.Name,
                description: details.Description,
                schema: details.Schema,
                func: details.Action,
              });
            },
            {
              Lazy: false,
              Name: `${aiLookup}|${toolLookup}`,
              Type: ioc.Symbol("Tool"),
            },
          );
        }
      });

      await Promise.all(toolCalls);
    });

    await Promise.all(calls);
  }

  protected async configureEaCVectorStores(
    eac: EverythingAsCodeSynaptic,
    ioc: IoCContainer,
  ): Promise<void> {
    const aiLookups = Object.keys(eac!.AIs || {});

    const calls = aiLookups.map(async (aiLookup) => {
      const ai = eac!.AIs![aiLookup];

      const vectorStoreLookups = Object.keys(ai.VectorStores || {});

      const vectorStoreCalls = vectorStoreLookups.map(
        async (vectorStoreLookup) => {
          const vectorStore = ai.VectorStores![vectorStoreLookup];

          const embeddings = await ioc.Resolve<Embeddings>(
            ioc.Symbol(Embeddings.name),
            `${aiLookup}|${vectorStore.Details!.EmbeddingsLookup}`,
          );

          if (isEaCAzureSearchAIVectorStoreDetails(vectorStore.Details)) {
            const vectorStoreDetails = vectorStore
              .Details as EaCAzureSearchAIVectorStoreDetails;

            ioc.Register(
              () => {
                debugger;
                return new AzureAISearchVectorStore(embeddings, {
                  endpoint: vectorStoreDetails.Endpoint,
                  key: vectorStoreDetails.APIKey,
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
            const vectorStoreDetails = vectorStore
              .Details as EaCMemoryVectorStoreDetails;

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
    this.configureEaCTools(eac, ioc);

    this.configureEaCLLMs(eac, ioc);

    this.configureEaCEmbeddings(eac, ioc);

    // await this.configureEaCVectorStores(eac, ioc);

    this.configureEaCIndexers(eac, ioc);

    this.configureEaCLoaders(eac, ioc);

    this.configureEaCTextSplitters(eac, ioc);

    this.configureEaCChatHistories(eac, ioc);

    await this.configureEaCRetrievers(eac, ioc);

    this.configureEaCCircuits(eac, ioc);
  }
}
