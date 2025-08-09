import { EaCRetrieverDetails } from "../../eac/EaCRetrieverDetails.ts";
import { EaCDetails } from "../../src.deps.ts";
import { Brand, ResourceBuilder } from "./ResourceBuilder.ts";

export type RetrieverId = Brand<string, "Retriever">;

export class RetrieverBuilder<
  TDetails extends EaCRetrieverDetails = EaCRetrieverDetails,
> extends ResourceBuilder<TDetails, EaCDetails<TDetails>, "Retriever"> {
  constructor(lookup: string, details: TDetails) {
    super(lookup, details);
  }

  Build(): Record<string, EaCDetails<TDetails>> {
    return this.BuildAs();
  }
}
