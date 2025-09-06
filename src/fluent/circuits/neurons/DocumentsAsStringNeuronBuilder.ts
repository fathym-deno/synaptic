import { EaCDocumentsAsStringNeuron } from "../../../eac/neurons/EaCDocumentsAsStringNeuron.ts";
import { NeuronBuilder } from "./NeuronBuilder.ts";

export class DocumentsAsStringNeuronBuilder
  extends NeuronBuilder<EaCDocumentsAsStringNeuron> {
  constructor(lookup: string) {
    super(lookup, { Type: "DocumentsAsString" });
  }
}
