import { assert, assertEquals } from "jsr:@std/assert@1.0.6";
import { GraphCircuitBuilder } from "../../src/fluent/circuits/GraphCircuitBuilder.ts";
import { NeuronBuilder } from "../../src/fluent/circuits/neurons/NeuronBuilder.ts";
import { EaCPassthroughNeuron } from "../../src/eac/neurons/EaCPassthroughNeuron.ts";

class SimpleNeuron extends NeuronBuilder<EaCPassthroughNeuron> {
  constructor(id: string) {
    super(id, { Type: "Passthrough" });
  }
}

Deno.test("GraphCircuitBuilder wires edges", () => {
  const a = new SimpleNeuron("a");
  const b = new SimpleNeuron("b");
  const circuit = new GraphCircuitBuilder()
    .Neuron(a)
    .Neuron(b)
    .Edge("a").To("b")
    .Build();

  assertEquals(circuit.Type, "Graph");
  assert(circuit.Neurons);
  assert(circuit.Edges);
  assertEquals(circuit.Edges["a"], "b");
});
