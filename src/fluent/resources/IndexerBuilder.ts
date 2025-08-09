import { EaCIndexerDetails } from "../../eac/EaCIndexerDetails.ts";
import { EaCDetails } from "../../src.deps.ts";
import { Brand, ResourceBuilder } from "./ResourceBuilder.ts";

export type IndexerId = Brand<string, "Indexer">;

export class IndexerBuilder<
  TDetails extends EaCIndexerDetails = EaCIndexerDetails,
> extends ResourceBuilder<TDetails, EaCDetails<TDetails>, "Indexer"> {
  constructor(lookup: string, details: TDetails) {
    super(lookup, details);
  }

  Build(): Record<string, EaCDetails<TDetails>> {
    return this.BuildAs();
  }
}
