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
import { EaCRetrieverAsCode } from "../eac/retrievers/EaCRetrieverAsCode.ts";

export const loadRetrieverDocs: (
  ioc: IoCContainer,
  retrieverLookup: string,
  retriever: EaCRetrieverAsCode,
  vectorStore: VectorStore,
) => Promise<unknown> = async (
  ioc,
  retrieverLookup,
  retriever,
  vectorStore,
) => {
  const logger = await getPackageLogger(import.meta);

  const details = retriever.Details!;

  const loadedDocs = (
    await Promise.all(
      details!.LoaderLookups.map(async (loaderLookup) => {
        const loader = await ioc.Resolve<BaseDocumentLoader>(
          ioc.Symbol("DocumentLoader"),
          loaderLookup,
        );

        const docs = await loader.load();

        const splitter = await ioc.Resolve<Runnable>(
          ioc.Symbol(TextSplitter.name),
          details!.LoaderTextSplitterLookups[loaderLookup],
        );

        const splitDocs = await splitter.invoke(docs);

        return splitDocs;
      }),
    )
  ).flatMap((ld) => ld);

  if (details!.IndexerLookup) {
    const recordManager = await ioc.Resolve<RecordManagerInterface>(
      ioc.Symbol("RecordManager"),
      details!.IndexerLookup,
    );

    let docs = loadedDocs.filter((ld) => ld.pageContent);

    let idxRes = {
      numAdded: 0,
      numDeleted: 0,
      numSkipped: 0,
      numUpdated: 0,
    };

    // while (docs.length) {
    // const isFirst = docs.length === loadedDocs.length;

    const slice = loadedDocs.length; //idxRes.numAdded >= 2040 ? 1 : 10;

    const nextDocs = docs.slice(0, slice);

    docs = docs.slice(slice);

    try {
      const ir = await index({
        docsSource: nextDocs,
        recordManager,
        vectorStore,
        options: {
          cleanup: "incremental",
          sourceIdKey: "source",
        },
      });

      logger.debug(`Retriever '${retrieverLookup}' index results:`, idxRes);

      idxRes = {
        numAdded: idxRes.numAdded + ir.numAdded,
        numDeleted: idxRes.numDeleted + ir.numDeleted,
        numSkipped: idxRes.numSkipped + ir.numSkipped,
        numUpdated: idxRes.numUpdated + ir.numUpdated,
      };
    } catch (err) {
      logger.error(
        `There was an issue indexing Retriever '${retrieverLookup}'`,
        err,
      );

      throw err;
    }
    // }

    return idxRes;
  } else {
    await vectorStore.addDocuments(loadedDocs);

    return {};
  }
};
