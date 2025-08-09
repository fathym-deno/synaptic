import { EaCLLMAsCode } from "../../eac/llms/EaCLLMAsCode.ts";
import { EaCLLMDetails } from "../../eac/llms/EaCLLMDetails.ts";
import { Brand, ResourceBuilder } from "./ResourceBuilder.ts";

export type LLMId = Brand<string, "LLM">;

export class LLMBuilder<
  TDetails extends EaCLLMDetails = EaCLLMDetails,
> extends ResourceBuilder<TDetails, EaCLLMAsCode, "LLM"> {
  constructor(lookup: string, details: TDetails) {
    super(lookup, details);
  }

  build(): Record<string, EaCLLMAsCode> {
    return this.buildAs();
  }
}
