import { EaCToolNeuron } from "../../../eac/neurons/EaCToolNeuron.ts";
import { ToolId } from "../../resources/ToolBuilder.ts";
import { NeuronBuilder } from "./NeuronBuilder.ts";

export class ToolNeuronBuilder extends NeuronBuilder<EaCToolNeuron> {
  constructor(lookup: string, tool: ToolId) {
    super(lookup, { Type: "Tool", ToolLookup: tool });
  }
}
