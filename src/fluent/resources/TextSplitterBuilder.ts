import { EaCTextSplitterAsCode } from "../../eac/EaCTextSplitterAsCode.ts";
import { EaCTextSplitterDetails } from "../../eac/EaCTextSplitterDetails.ts";
import { Brand, ResourceBuilder } from "./ResourceBuilder.ts";

export type TextSplitterId = Brand<string, "TextSplitter">;

export class TextSplitterBuilder<
  TDetails extends EaCTextSplitterDetails = EaCTextSplitterDetails,
> extends ResourceBuilder<TDetails, EaCTextSplitterAsCode, "TextSplitter"> {
  constructor(lookup: string, details: TDetails) {
    super(lookup, details);
  }

  Build(): Record<string, EaCTextSplitterAsCode> {
    return this.BuildAs();
  }
}
