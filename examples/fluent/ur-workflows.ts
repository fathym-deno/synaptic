import { END, START } from "npm:@langchain/langgraph@0.2.56";
import { z } from "npm:zod";
import {
  ChatPromptNeuronBuilder,
  GraphCircuitBuilder,
  ToolNeuronBuilder,
} from "../../src/fluent/circuits/_exports.ts";
import {
  LLMBuilder,
  PersonalityBuilder,
  ToolBuilder,
} from "../../src/fluent/resources/index.ts";
import { buildState } from "../../src/fluent/state/StateBuilder.ts";

// Define resources
const llm = new LLMBuilder("thinky-llm", {
  Type: "OpenAI",
  ModelName: "gpt-4o-mini",
  APIKey: "fake",
});

const persona = new PersonalityBuilder("workflow-analyst", {
  Instructions: ["Assist with requirement workflows."],
});

const searchTool = new ToolBuilder("search", {
  Type: "Dynamic",
  Name: "search",
  Description: "Search existing requirements",
  Schema: z.object({ query: z.string() }),
  Action: ({ query }: { query: string }) => `results for ${query}`,
});

// Circuit state
const state = buildState((s) =>
  s.Field("messages", {
    reducer: (x: string[], y: string[]) => x.concat(y),
    default: () => [],
  })
);

// Build neurons
const agent = new ChatPromptNeuronBuilder("agent", {
  personality: persona.id,
  newMessages: [["human", "{input}"]],
});

const tool = new ToolNeuronBuilder("search-tool", searchTool.id);

// Assemble the graph circuit with typed edges
const circuit = new GraphCircuitBuilder()
  .State(state)
  .Neuron(agent)
  .Neuron(tool)
  .Edge({ id: START } as { id: typeof START }).To(agent)
  .Edge(agent).To({ [END]: END, tools: tool }, {
    Condition: (s: { messages: string[] }) => {
      const last = s.messages.at(-1) ?? "";
      return last.includes("search") ? "tools" : END;
    },
  })
  .Edge(tool).To(agent)
  .Build();

// Export EverythingAsCode fragment
export const eac = {
  AIs: {
    example: {
      LLMs: llm.build(),
      Personalities: persona.build(),
      Tools: searchTool.build(),
    },
  },
  Circuits: {
    "ur-workflows": { Details: circuit },
  },
};

console.log(JSON.stringify(eac, null, 2));
