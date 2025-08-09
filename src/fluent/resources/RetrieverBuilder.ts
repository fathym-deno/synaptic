import { EaCRetrieverAsCode } from "../../eac/EaCRetrieverAsCode.ts";
import { EaCRetrieverDetails } from "../../eac/EaCRetrieverDetails.ts";
import { Brand, ResourceBuilder } from "./ResourceBuilder.ts";

export type RetrieverId = Brand<string, "Retriever">;

export class RetrieverBuilder<
  TDetails extends EaCRetrieverDetails = EaCRetrieverDetails,
> extends ResourceBuilder<TDetails, EaCRetrieverAsCode, "Retriever"> {
  constructor(lookup: string, details: TDetails) {
    super(lookup, details);
  }

  Build(): Record<string, EaCRetrieverAsCode> {
    return this.BuildAs();
  }
}
