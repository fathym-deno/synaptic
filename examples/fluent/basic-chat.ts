import { Annotation, START, END } from "npm:@langchain/langgraph@0.2.56";
import {
  ChatPromptNeuronBuilder,
  GraphCircuitBuilder,
} from "../../src/fluent/circuits/_exports.ts";
import { PersonalityBuilder } from "../../src/fluent/resources/PersonalityBuilder.ts";
import { buildState } from "../../src/fluent/state/StateBuilder.ts";

// Define a personality resource that the chat prompt will use
const piratePersona = new PersonalityBuilder("pirate", {
  Instructions: ["Answer like a pirate"],
});

// Describe the circuit state: an accumulating list of messages
const state = buildState((s) =>
  s.Field("messages", {
    reducer: (x: string[], y: string[]) => x.concat(y),
    default: () => [],
  })
);

// Build a chat prompt neuron that sends new human messages
const agent = new ChatPromptNeuronBuilder("agent", {
  personality: piratePersona.id,
  newMessages: [["human", "{input}"]],
});

// Assemble the graph circuit with explicit edges
const circuit = new GraphCircuitBuilder()
  .State(state)
  .Neuron(agent)
  // Start -> agent
  .Edge({ id: START } as any).To(agent)
  // agent -> END
  .Edge(agent).To(END)
  .Build();

// Export an EverythingAsCode fragment representing the circuit
export const eac = {
  AIs: {
    example: {
      Personalities: piratePersona.Build(),
    },
  },
  Circuits: {
    "basic-chat": { Details: circuit },
  },
};

console.log(JSON.stringify(eac, null, 2));
