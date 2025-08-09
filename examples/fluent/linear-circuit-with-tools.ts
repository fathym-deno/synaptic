import { z } from "npm:zod";
import {
  ChatPromptNeuronBuilder,
  LinearCircuitBuilder,
  ToolNeuronBuilder,
} from "../../src/fluent/circuits/_exports.ts";
import { PersonalityBuilder } from "../../src/fluent/resources/PersonalityBuilder.ts";
import { ToolBuilder } from "../../src/fluent/resources/ToolBuilder.ts";

// Define resources used by the circuit
const persona = new PersonalityBuilder("analyst", {
  Instructions: ["Extract the user's requirement and summarize it."],
});

const extractTool = new ToolBuilder("extract", {
  Type: "Dynamic",
  Name: "extract",
  Description: "Extract user requirements from text",
  Schema: z.object({ text: z.string() }),
  Action: async (input: { text: string }) => `User requires: ${input.text}`,
});

// Build neurons for the linear flow
const agent = new ChatPromptNeuronBuilder("agent", {
  personality: persona.id,
  newMessages: [["human", "{text}"]],
});

const tool = new ToolNeuronBuilder("extract-tool", extractTool.id);

// Assemble the linear circuit
const circuit = new LinearCircuitBuilder()
  .Neuron(agent)
  .Neuron(tool)
  .Chain(agent, tool)
  .Build();

// Export EverythingAsCode fragment
export const eac = {
  AIs: {
    example: {
      Personalities: persona.build(),
      Tools: extractTool.build(),
    },
  },
  Circuits: {
    "user-requirement-extract": { Details: circuit },
  },
};

console.log(JSON.stringify(eac, null, 2));
