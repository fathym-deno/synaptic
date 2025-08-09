import { assertEquals } from "../../tests.deps.ts";
import {
  ChatPromptNeuronBuilder,
  GraphCircuitBuilder,
  ToolNeuronBuilder,
} from "../../../src/fluent/circuits/_exports.ts";
import { PersonalityId } from "../../../src/fluent/resources/PersonalityBuilder.ts";
import { ToolId } from "../../../src/fluent/resources/ToolBuilder.ts";

Deno.test("GraphCircuitBuilder builds graph", () => {
  const agent = new ChatPromptNeuronBuilder("agent", {
    personality: "p" as PersonalityId,
  });
  const tool = new ToolNeuronBuilder("tool", "t" as ToolId);

  const details = new GraphCircuitBuilder()
    .Neuron(agent)
    .Neuron(tool)
    .Edge(agent)
    .To(tool)
    .Build();

  assertEquals(Object.keys(details.Neurons ?? {}), ["agent", "tool"]);
  assertEquals(details.Edges.agent, "tool");
  assertEquals(details.Type, "Graph");
});
