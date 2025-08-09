import { EaCEmbeddingsAsCode } from "../../eac/EaCEmbeddingsAsCode.ts";
import { EaCEmbeddingsDetails } from "../../eac/EaCEmbeddingsDetails.ts";
import { Brand, ResourceBuilder } from "./ResourceBuilder.ts";

export type EmbeddingsId = Brand<string, "Embeddings">;

export class EmbeddingsBuilder<
  TDetails extends EaCEmbeddingsDetails = EaCEmbeddingsDetails,
> extends ResourceBuilder<TDetails, EaCEmbeddingsAsCode, "Embeddings"> {
  constructor(lookup: string, details: TDetails) {
    super(lookup, details);
  }

  Build(): Record<string, EaCEmbeddingsAsCode> {
    return this.BuildAs();
  }
}
