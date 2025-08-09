import { EaCTextSplitterDetails } from "../../eac/EaCTextSplitterDetails.ts";
import { EaCDetails } from "../../src.deps.ts";
import { Brand, ResourceBuilder } from "./ResourceBuilder.ts";

export type TextSplitterId = Brand<string, "TextSplitter">;

export class TextSplitterBuilder<
  TDetails extends EaCTextSplitterDetails = EaCTextSplitterDetails,
> extends ResourceBuilder<TDetails, EaCDetails<TDetails>, "TextSplitter"> {
  constructor(lookup: string, details: TDetails) {
    super(lookup, details);
  }

  Build(): Record<string, EaCDetails<TDetails>> {
    return this.BuildAs();
  }
}
