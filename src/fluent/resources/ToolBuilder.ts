import { EaCToolDetails } from "../../eac/EaCToolDetails.ts";
import { EaCDetails } from "../../src.deps.ts";
import { Brand, ResourceBuilder } from "./ResourceBuilder.ts";

export type ToolId = Brand<string, "Tool">;

export class ToolBuilder<
  TDetails extends EaCToolDetails = EaCToolDetails,
> extends ResourceBuilder<TDetails, EaCDetails<TDetails>, "Tool"> {
  constructor(lookup: string, details: TDetails) {
    super(lookup, details);
  }

  Build(): Record<string, EaCDetails<TDetails>> {
    return this.BuildAs();
  }
}
