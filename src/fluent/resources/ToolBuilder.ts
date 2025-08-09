import { EaCToolAsCode } from "../../eac/EaCToolAsCode.ts";
import { EaCToolDetails } from "../../eac/EaCToolDetails.ts";
import { Brand, ResourceBuilder } from "./ResourceBuilder.ts";

export type ToolId = Brand<string, "Tool">;

export class ToolBuilder<
  TDetails extends EaCToolDetails = EaCToolDetails,
> extends ResourceBuilder<TDetails, EaCToolAsCode, "Tool"> {
  constructor(lookup: string, details: TDetails) {
    super(lookup, details);
  }

  Build(): Record<string, EaCToolAsCode> {
    return this.BuildAs();
  }
}
