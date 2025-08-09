import { EaCDocumentLoaderDetails } from "../../eac/EaCDocumentLoaderDetails.ts";
import { EaCDetails } from "../../src.deps.ts";
import { Brand, ResourceBuilder } from "./ResourceBuilder.ts";

export type DocumentLoaderId = Brand<string, "DocumentLoader">;

export class DocumentLoaderBuilder<
  TDetails extends EaCDocumentLoaderDetails = EaCDocumentLoaderDetails,
> extends ResourceBuilder<TDetails, EaCDetails<TDetails>, "DocumentLoader"> {
  constructor(lookup: string, details: TDetails) {
    super(lookup, details);
  }

  Build(): Record<string, EaCDetails<TDetails>> {
    return this.BuildAs();
  }
}
