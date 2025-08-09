import { EaCIndexerAsCode } from "../../eac/EaCIndexerAsCode.ts";
import { EaCIndexerDetails } from "../../eac/EaCIndexerDetails.ts";
import { Brand, ResourceBuilder } from "./ResourceBuilder.ts";

export type IndexerId = Brand<string, "Indexer">;

export class IndexerBuilder<
  TDetails extends EaCIndexerDetails = EaCIndexerDetails,
> extends ResourceBuilder<TDetails, EaCIndexerAsCode, "Indexer"> {
  constructor(lookup: string, details: TDetails) {
    super(lookup, details);
  }

  Build(): Record<string, EaCIndexerAsCode> {
    return this.BuildAs();
  }
}
