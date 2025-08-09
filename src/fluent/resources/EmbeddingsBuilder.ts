import { EaCEmbeddingsDetails } from "../../eac/EaCEmbeddingsDetails.ts";
import { EaCDetails } from "../../src.deps.ts";
import { Brand, ResourceBuilder } from "./ResourceBuilder.ts";

export type EmbeddingsId = Brand<string, "Embeddings">;

export class EmbeddingsBuilder<
  TDetails extends EaCEmbeddingsDetails = EaCEmbeddingsDetails,
> extends ResourceBuilder<TDetails, EaCDetails<TDetails>, "Embeddings"> {
  constructor(lookup: string, details: TDetails) {
    super(lookup, details);
  }

  Build(): Record<string, EaCDetails<TDetails>> {
    return this.BuildAs();
  }
}
