import { EaCDocumentLoaderAsCode } from "../../eac/EaCDocumentLoaderAsCode.ts";
import { EaCDocumentLoaderDetails } from "../../eac/EaCDocumentLoaderDetails.ts";
import { Brand, ResourceBuilder } from "./ResourceBuilder.ts";

export type DocumentLoaderId = Brand<string, "DocumentLoader">;

export class DocumentLoaderBuilder<
  TDetails extends EaCDocumentLoaderDetails = EaCDocumentLoaderDetails,
> extends ResourceBuilder<TDetails, EaCDocumentLoaderAsCode, "DocumentLoader"> {
  constructor(lookup: string, details: TDetails) {
    super(lookup, details);
  }

  build(): Record<string, EaCDocumentLoaderAsCode> {
    return this.buildAs();
  }
}
