import { EaCVectorStoreDetails } from "../../eac/EaCVectorStoreDetails.ts";
import { EaCDetails } from "../../src.deps.ts";
import { Brand, ResourceBuilder } from "./ResourceBuilder.ts";

export type VectorStoreId = Brand<string, "VectorStore">;

export class VectorStoreBuilder<
  TDetails extends EaCVectorStoreDetails = EaCVectorStoreDetails,
> extends ResourceBuilder<TDetails, EaCDetails<TDetails>, "VectorStore"> {
  constructor(lookup: string, details: TDetails) {
    super(lookup, details);
  }

  Build(): Record<string, EaCDetails<TDetails>> {
    return this.BuildAs();
  }
}
