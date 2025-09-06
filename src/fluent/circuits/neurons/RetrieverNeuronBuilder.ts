import { EaCRetrieverNeuron } from "../../../eac/neurons/EaCRetrieverNeuron.ts";
import { NeuronBuilder } from "./NeuronBuilder.ts";

export class RetrieverNeuronBuilder extends NeuronBuilder<EaCRetrieverNeuron> {
  constructor(lookup: string, retrieverLookup: string) {
    super(lookup, { Type: "Retriever", RetrieverLookup: retrieverLookup });
  }
}
