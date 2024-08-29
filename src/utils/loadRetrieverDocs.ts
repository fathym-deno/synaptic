import { EaCRetrieverAsCode } from "../eac/EaCRetrieverAsCode.ts";
import {
  BaseDocumentLoader,
  getPackageLogger,
  index,
  IoCContainer,
  RecordManagerInterface,
  Runnable,
  TextSplitter,
  VectorStore,
} from "../src.deps.ts";

export const loadRetrieverDocs: (
  ioc: IoCContainer,
  retrieverLookup: string,
  retriever: EaCRetrieverAsCode,
  vectorStore: VectorStore,
) => Promise<void> = async (ioc, retrieverLookup, retriever, vectorStore) => {
  const logger = await getPackageLogger();

  const loadedDocs = (
    await Promise.all(
      retriever.Details!.LoaderLookups.map(async (loaderLookup) => {
        const loader = await ioc.Resolve<BaseDocumentLoader>(
          ioc.Symbol("DocumentLoader"),
          loaderLookup,
        );

        const docs = await loader.load();

        const splitter = await ioc.Resolve<Runnable>(
          ioc.Symbol(TextSplitter.name),
          retriever.Details!.LoaderTextSplitterLookups[loaderLookup],
        );

        const splitDocs = await splitter.invoke(docs);

        return splitDocs;
      }),
    )
  ).flatMap((ld) => ld);

  if (retriever.Details!.IndexerLookup) {
    const recordManager = await ioc.Resolve<RecordManagerInterface>(
      ioc.Symbol("RecordManager"),
      retriever.Details!.IndexerLookup,
    );

    try {
      const idxRes = await index({
        docsSource: loadedDocs,
        recordManager,
        vectorStore,
        options: {
          cleanup: "incremental",
          sourceIdKey: "source",
        },
      });

      logger.debug(`Retriever '${retrieverLookup}' index results:`, idxRes);
    } catch (err) {
      logger.error(
        `There was an issue indexing Retriever '${retrieverLookup}'`,
        err,
      );

      throw err;
    }
  } else {
    await vectorStore.addDocuments(loadedDocs);
  }
};
