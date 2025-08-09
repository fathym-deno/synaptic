import { START, END } from "npm:@langchain/langgraph@0.2.56";
import { GraphCircuitBuilder } from "../../src/fluent/circuits/_exports.ts";
import { NeuronBuilder } from "../../src/fluent/circuits/neurons/NeuronBuilder.ts";
import { EaCPassthroughNeuron } from "../../src/eac/neurons/EaCPassthroughNeuron.ts";
import { StateBuilder } from "../../src/fluent/state/StateBuilder.ts";

// Simple passthrough neuron builder that appends a value to state
class SimpleNeuron extends NeuronBuilder<EaCPassthroughNeuron> {
  constructor(id: string, value: string) {
    super(id, {
      Type: "Passthrough",
      BootstrapInput: (state: { aggregate: string[] }) => ({
        aggregate: state.aggregate.concat(`I'm ${value}`),
      }),
    });
  }
}

const state = new StateBuilder()
  .Field("aggregate", {
    reducer: (x: string[], y: string[]) => x.concat(y),
    default: () => [],
  })
  .Build();

const a = new SimpleNeuron("a", "A");
const b = new SimpleNeuron("b", "B");
const c = new SimpleNeuron("c", "C");
const d = new SimpleNeuron("d", "D");

const circuit = new GraphCircuitBuilder()
  .state(state)
  .neuron(a)
  .neuron(b)
  .neuron(c)
  .neuron(d)
  .edge({ id: START } as any).to(a)
  .edge(a).to([b, c])
  .edge(b).to(d)
  .edge(c).to(d)
  .edge(d).to(END)
  .build();

export const eac = {
  Circuits: {
    "branching-example": { Details: circuit },
  },
};

console.log(JSON.stringify(eac, null, 2));
