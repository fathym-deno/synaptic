// deno-lint-ignore-file no-explicit-any
import 'npm:cheerio';
import {
  AzureAISearchVectorStore,
  AzureChatOpenAI,
  AzureOpenAIEmbeddings,
  BaseDocumentLoader,
  BaseLanguageModel,
  BaseListChatMessageHistory,
  BaseMessagePromptTemplateLike,
  BasePromptTemplate,
  ChatPromptTemplate,
  CheerioWebBaseLoader,
  createStuffDocumentsChain,
  EaCAzureOpenAIEmbeddingsDetails,
  EaCAzureOpenAILLMDetails,
  EaCDenoKVChatHistoryDetails,
  EaCRuntimeConfig,
  EaCRuntimePlugin,
  EaCRuntimePluginConfig,
  EaCWatsonXLLMDetails,
  Embeddings,
  HNSWLib,
  index,
  IoCContainer,
  isEaCAzureOpenAIEmbeddingsDetails,
  isEaCAzureOpenAILLMDetails,
  isEaCDenoKVChatHistoryDetails,
  isEaCWatsonXLLMDetails,
  LanguageModelLike,
  MemoryVectorStore,
  merge,
  PromptTemplate,
  RecordManagerInterface,
  RecursiveCharacterTextSplitter,
  Runnable,
  RunnableMap,
  RunnablePassthrough,
  RunnableWithMessageHistory,
  TextSplitter,
  VectorStore,
  WatsonxAI,
} from '../src.deps.ts';
import {
  EaCHNSWVectorStoreDetails,
  isEaCHNSWVectorStoreDetails,
} from '../eac/EaCHNSWVectorStoreDetails.ts';
import {
  EaCMemoryVectorStoreDetails,
  isEaCMemoryVectorStoreDetails,
} from '../eac/EaCMemoryVectorStoreDetails.ts';
import {
  EaCAzureSearchAIVectorStoreDetails,
  isEaCAzureSearchAIVectorStoreDetails,
} from '../eac/EaCAzureSearchAIVectorStoreDetails.ts';
import {
  EaCDenoKVIndexerDetails,
  isEaCDenoKVIndexerDetails,
} from '../eac/EaCDenoKVIndexerDetails.ts';
import { DenoKVRecordManager } from '../indexing/DenoKVRecordManager.ts';
import {
  EaCCheerioWebDocumentLoaderDetails,
  isEaCCheerioWebDocumentLoaderDetails,
} from '../eac/EaCCheerioWebDocumentLoaderDetails.ts';
import { EverythingAsCodeSynaptic } from '../eac/EverythingAsCodeSynaptic.ts';
import { DenoKVChatMessageHistory } from '../memory/DenoKVChatMessageHistory.ts';
import { EaCNeuron, EaCNeuronLike, isEaCNeuron } from '../eac/EaCNeuron.ts';
import { isEaCLLMNeuron } from '../eac/EaCLLMNeuron.ts';
import { isEaCPromptNeuron } from '../eac/EaCPromptNeuron.ts';
import { isEaCChatPromptNeuron } from '../eac/EaCChatPromptNeuron.ts';
import { isEaCChatHistoryNeuron } from '../eac/EaCChatHistoryNeuron.ts';
import { isEaCCircuitDetails } from '../eac/EaCCircuitDetails.ts';
import {
  EaCRecursiveCharacterTextSplitterDetails,
  isEaCRecursiveCharacterTextSplitterDetails,
} from '../eac/EaCRecursiveCharacterTextSplitterDetails.ts';
import { isEaCStuffDocumentsNeuron } from '../eac/EaCStuffDocumentsNeuron.ts';

export default class FathymSynapticEaCServicesPlugin
  implements EaCRuntimePlugin
{
  public async AfterEaCResolved(
    eac: EverythingAsCodeSynaptic,
    ioc: IoCContainer
  ): Promise<void> {
    await this.configureEaCSynaptic(eac, ioc);
  }

  public Setup(_config: EaCRuntimeConfig): Promise<EaCRuntimePluginConfig> {
    const pluginConfig: EaCRuntimePluginConfig = {
      Name: 'FathymSynapticEaCServicesPlugin',
    };

    return Promise.resolve(pluginConfig);
  }

  protected configureEaCChatHistories(
    eac: EverythingAsCodeSynaptic,
    ioc: IoCContainer
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
                chDetails.DenoKVDatabaseLookup
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
              Type: ioc.Symbol('ChatHistory'),
            }
          );
        }
      });
    });
  }

  protected configureEaCCircuits(
    eac: EverythingAsCodeSynaptic,
    ioc: IoCContainer
  ): void {
    const circuitLookups = Object.keys(eac.Circuits || {});

    const resolveNeuron = async (neuron: EaCNeuronLike): Promise<Runnable> => {
      let runnable: Runnable = new RunnablePassthrough();

      if (neuron) {
        if (typeof neuron === 'string') {
          neuron = eac.Circuits!.$neurons![neuron];
        } else if (Array.isArray(neuron)) {
          const [neoronLookup, neuronOverride] = neuron as [string, EaCNeuron];

          neuron = eac.Circuits!.$neurons![neoronLookup];

          neuron = merge(neuron, neuronOverride);
        }

        if (isEaCNeuron(neuron.Type, neuron)) {
          if (isEaCLLMNeuron(neuron)) {
            const llm = await ioc.Resolve<BaseLanguageModel>(
              ioc.Symbol(BaseLanguageModel.name),
              neuron.LLMLookup
            );

            runnable = llm;
          } else if (isEaCPromptNeuron(neuron)) {
            const prompt = PromptTemplate.fromTemplate(neuron.PromptTemplate);

            runnable = prompt;
          } else if (isEaCChatPromptNeuron(neuron)) {
            const messages: BaseMessagePromptTemplateLike[] = [];

            if (neuron.SystemMessage) {
              messages.push(['system', neuron.SystemMessage]);
            }

            if (neuron.Messages) {
              messages.push(...neuron.Messages);
            }

            if (neuron.NewMessages) {
              messages.push(...neuron.NewMessages);
            }

            const prompt = ChatPromptTemplate.fromMessages(messages);

            runnable = prompt;
          }

          const childRunnable = await resolveNeurons(neuron.Neurons);

          if (childRunnable) {
            if (isEaCChatHistoryNeuron(neuron)) {
              const getMessageHistory = await ioc.Resolve<
                (sessionId: string) => BaseListChatMessageHistory
              >(ioc.Symbol('ChatHistory'), neuron.ChatHistoryLookup);

              runnable = new RunnableWithMessageHistory({
                runnable: childRunnable,
                getMessageHistory: async (sessionId: string) => {
                  const chatHistory = getMessageHistory(sessionId);

                  const messages = await chatHistory.getMessages();

                  if (!(messages.length > 0)) {
                    await chatHistory.addMessages(neuron.Messages || []);
                  }

                  return chatHistory;
                },
                inputMessagesKey: neuron.InputKey,
                historyMessagesKey: neuron.HistoryKey,
              });
            } else if (isEaCStuffDocumentsNeuron(neuron)) {
              runnable = (await createStuffDocumentsChain({
                llm: (await resolveNeuron(
                  neuron.LLMNeuron
                )) as LanguageModelLike as any,
                prompt: childRunnable as BasePromptTemplate as any,
              })) as any;
            } else {
              runnable = runnable.pipe(childRunnable);
            }
          }
        }
      }

      return runnable;
    };

    const resolveNeurons = async (
      neurons?: Record<string, EaCNeuron>
    ): Promise<Runnable | undefined> => {
      let runnable: Runnable | undefined = undefined;

      const neuronLookups = Object.keys(neurons || {});

      if (neurons && neuronLookups.length > 0) {
        if (neuronLookups.length === 1 && '' in neurons) {
          const neuron = neurons[''];

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
      const circuit = eac.Circuits![circuitLookup];

      if (isEaCCircuitDetails(undefined, circuit.Details)) {
        const chDetails = circuit.Details; // as EaCDenoKVChatHistoryDetails;

        ioc.Register(
          async () => {
            // TODO: Circuit Logic... Or classes to register for controlling each circuit?
            const circuit = await resolveNeurons(chDetails.Neurons);

            return circuit;
          },
          {
            Lazy: false,
            Name: circuitLookup,
            Type: ioc.Symbol('Circuit'),
          }
        );
      }
    });
  }

  protected configureEaCEmbeddings(
    eac: EverythingAsCodeSynaptic,
    ioc: IoCContainer
  ): void {
    const aiLookups = Object.keys(eac!.AIs || {});

    aiLookups.forEach((aiLookup) => {
      const ai = eac!.AIs![aiLookup];

      const embeddingsLookups = Object.keys(ai.Embeddings || {});

      embeddingsLookups.forEach((embeddingsLookup) => {
        const embeddings = ai.Embeddings![embeddingsLookup];

        if (isEaCAzureOpenAIEmbeddingsDetails(embeddings.Details)) {
          const embeddingsDetails =
            embeddings.Details as EaCAzureOpenAIEmbeddingsDetails;

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
            }
          );
        }
      });
    });
  }

  protected configureEaCIndexers(
    eac: EverythingAsCodeSynaptic,
    ioc: IoCContainer
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
              Type: ioc.Symbol('RecordManager'),
            }
          );
        }
      });
    });
  }

  protected configureEaCLLMs(
    eac: EverythingAsCodeSynaptic,
    ioc: IoCContainer
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
            () =>
              new AzureChatOpenAI({
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
              }),
            {
              Lazy: false,
              Name: `${aiLookup}|${llmLookup}`,
              Type: ioc.Symbol(BaseLanguageModel.name),
            }
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
            }
          );
        }
      });
    });
  }

  protected configureEaCLoaders(
    eac: EverythingAsCodeSynaptic,
    ioc: IoCContainer
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
            Type: ioc.Symbol('DocumentLoader'),
          });
        }
      });
    });
  }

  protected async configureEaCRetrievers(
    eac: EverythingAsCodeSynaptic,
    ioc: IoCContainer
  ): Promise<void> {
    const retrieverLookups = Object.keys(eac.Retrievers || {});

    const retrieverCalls = retrieverLookups.map(async (retrieverLookup) => {
      const retriever = eac.Retrievers![retrieverLookup];

      const loaderCalls = retriever.Details!.LoaderLookups.map(
        async (loaderLookup) => {
          const loader = await ioc.Resolve<BaseDocumentLoader>(
            ioc.Symbol('DocumentLoader'),
            loaderLookup
          );

          const docs = await loader.load();

          return docs;
        }
      );

      const loadedDocs = await Promise.all(loaderCalls);

      const splitter = await ioc.Resolve<TextSplitter>(
        ioc.Symbol('TextSplitter'),
        retriever.Details!.TextSplitterLookup
      );

      const splitDocs = await splitter.splitDocuments(
        loadedDocs.flatMap((ld) => ld)
      );

      const vectorStore = await ioc.Resolve<VectorStore>(
        ioc.Symbol(VectorStore.name),
        retriever.Details!.VectorStoreLookup
      );

      if (retriever.Details!.IndexerLookup) {
        const recordManager = await ioc.Resolve<RecordManagerInterface>(
          ioc.Symbol('RecordManager'),
          retriever.Details!.IndexerLookup
        );

        try {
          const idxRes = await index({
            docsSource: splitDocs,
            recordManager,
            vectorStore,
            options: {
              cleanup: 'incremental',
              sourceIdKey: 'source',
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
    ioc: IoCContainer
  ): void {
    const aiLookups = Object.keys(eac!.AIs || {});

    aiLookups.forEach((aiLookup) => {
      const ai = eac!.AIs![aiLookup];

      const textSplitterLookups = Object.keys(ai.TextSplitters || {});

      textSplitterLookups.forEach((textSplitterLookup) => {
        const txtSplitter = ai.TextSplitters![textSplitterLookup];

        if (isEaCRecursiveCharacterTextSplitterDetails(txtSplitter.Details)) {
          const details =
            txtSplitter.Details as EaCRecursiveCharacterTextSplitterDetails;

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
              Type: ioc.Symbol('TextSplitter'),
            }
          );
        }
      });
    });
  }

  protected async configureEaCVectorStores(
    eac: EverythingAsCodeSynaptic,
    ioc: IoCContainer
  ): Promise<void> {
    const aiLookups = Object.keys(eac!.AIs || {});

    const calls = aiLookups.map(async (aiLookup) => {
      const ai = eac!.AIs![aiLookup];

      const vectorStoreLookups = Object.keys(ai.VectorStores || {});

      const vectorStoreCalls = vectorStoreLookups.map(async (vectorStoreLookup) => {
        const vectorStore = ai.VectorStores![vectorStoreLookup];

        const embeddings = await ioc.Resolve<Embeddings>(
          ioc.Symbol(Embeddings.name),
          `${aiLookup}|${vectorStore.Details!.EmbeddingsLookup}`
        );

        if (isEaCAzureSearchAIVectorStoreDetails(vectorStore.Details)) {
          const vectorStoreDetails =
            vectorStore.Details as EaCAzureSearchAIVectorStoreDetails;

          ioc.Register(
            () =>
              new AzureAISearchVectorStore(embeddings, {
                endpoint: vectorStoreDetails.Endpoint,
                key: vectorStoreDetails.APIKey,
                search: {
                  type: vectorStoreDetails.QueryType,
                },
              }),
            {
              Lazy: false,
              Name: `${aiLookup}|${vectorStoreLookup}`,
              Type: ioc.Symbol(VectorStore.name),
            }
          );
        } else if (isEaCHNSWVectorStoreDetails(vectorStore.Details)) {
          const vectorStoreDetails =
            vectorStore.Details as EaCHNSWVectorStoreDetails;

          ioc.Register(
            () =>
              new HNSWLib(embeddings, {
                space: vectorStoreDetails.Space,
              }),
            {
              Lazy: false,
              Name: `${aiLookup}|${vectorStoreLookup}`,
              Type: ioc.Symbol(VectorStore.name),
            }
          );
        } else if (isEaCMemoryVectorStoreDetails(vectorStore.Details)) {
          const vectorStoreDetails =
            vectorStore.Details as EaCMemoryVectorStoreDetails;

          ioc.Register(() => new MemoryVectorStore(embeddings), {
            Lazy: false,
            Name: `${aiLookup}|${vectorStoreLookup}`,
            Type: ioc.Symbol(VectorStore.name),
          });
        }
      });

      await Promise.all(vectorStoreCalls);
    });

    await Promise.all(calls);
  }

  protected async configureEaCSynaptic(
    eac: EverythingAsCodeSynaptic,
    ioc: IoCContainer
  ): Promise<void> {
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
