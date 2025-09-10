import { EaCPassthroughNeuron } from "../../../eac/neurons/EaCPassthroughNeuron.ts";
import { NeuronBuilder } from "./NeuronBuilder.ts";

export class PassthroughNeuronBuilder
  extends NeuronBuilder<EaCPassthroughNeuron> {
  constructor(lookup: string, field?: string) {
    super(lookup, { Type: "Passthrough", Field: field });
  }
}
