import { EaCVectorStoreAsCode } from "../../eac/EaCVectorStoreAsCode.ts";
import { EaCVectorStoreDetails } from "../../eac/EaCVectorStoreDetails.ts";
import { Brand, ResourceBuilder } from "./ResourceBuilder.ts";

export type VectorStoreId = Brand<string, "VectorStore">;

export class VectorStoreBuilder<
  TDetails extends EaCVectorStoreDetails = EaCVectorStoreDetails,
> extends ResourceBuilder<TDetails, EaCVectorStoreAsCode, "VectorStore"> {
  constructor(lookup: string, details: TDetails) {
    super(lookup, details);
  }

  Build(): Record<string, EaCVectorStoreAsCode> {
    return this.BuildAs();
  }
}
