import { EaCStringOutputParserNeuron } from "../../../eac/neurons/EaCStringOutputParserNeuron.ts";
import { NeuronBuilder } from "./NeuronBuilder.ts";

export class StringOutputParserNeuronBuilder
  extends NeuronBuilder<EaCStringOutputParserNeuron> {
  constructor(lookup: string) {
    super(lookup, { Type: "StringOutputParser" });
  }
}
