import { EaCLLMDetails } from "../../eac/llms/EaCLLMDetails.ts";
import { EaCDetails } from "../../src.deps.ts";
import { Brand, ResourceBuilder } from "./ResourceBuilder.ts";

export type LLMId = Brand<string, "LLM">;

export class LLMBuilder<
  TDetails extends EaCLLMDetails = EaCLLMDetails,
> extends ResourceBuilder<TDetails, EaCDetails<TDetails>, "LLM"> {
  constructor(lookup: string, details: TDetails) {
    super(lookup, details);
  }

  Build(): Record<string, EaCDetails<TDetails>> {
    return this.BuildAs();
  }
}
