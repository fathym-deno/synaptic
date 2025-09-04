import { z } from "npm:zod";
import { ChatPromptNeuronBuilder, LinearCircuitBuilder, ToolNeuronBuilder } from "../../src/fluent/circuits/.exports.ts";
import { PersonalityBuilder } from "../../src/fluent/resources/PersonalityBuilder.ts";
import { ToolBuilder } from "../../src/fluent/resources/ToolBuilder.ts";
import { BuildState } from "../../src/fluent/state/StateBuilder.ts";
import { InputBuilder } from "../../src/fluent/state/InputBuilder.ts";

// Define circuit state and typed input
const state = BuildState((s) =>
  s.Field("text", {
    reducer: (_x, y: string) => y,
    default: () => "",
  }).Field("requirement", {
    reducer: (_x, y: string) => y,
    default: () => "",
  })
);

const input = InputBuilder(state, {
  text: z.string(),
});

// Define resources used by the circuit
const persona = new PersonalityBuilder("analyst", {
  Instructions: ["Extract the user's requirement and summarize it."],
});

const extractTool = new ToolBuilder("extract", {
  Type: "Dynamic",
  Name: "extract",
  Description: "Extract user requirements from text",
  Schema: z.object({ text: z.string() }),
  Action: ({ text }: { text: string }) => `User requires: ${text}`,
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

// Export EverythingAsCode fragment and typed input
export const eac = {
  AIs: {
    example: {
      Personalities: persona.Build(),
      Tools: extractTool.Build(),
    },
  },
  Circuits: {
    "user-requirement-extract": { Details: circuit },
  },
};

export type UserRequirementInput = typeof input.Type;

console.log(JSON.stringify(eac, null, 2));
