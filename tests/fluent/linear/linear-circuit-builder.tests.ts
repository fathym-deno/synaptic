import { assertEquals } from "../../tests.deps.ts";
import {
  ChatPromptNeuronBuilder,
  LinearCircuitBuilder,
  ToolNeuronBuilder,
} from "../../../src/fluent/circuits/_exports.ts";
import { PersonalityId } from "../../../src/fluent/resources/PersonalityBuilder.ts";
import { ToolId } from "../../../src/fluent/resources/ToolBuilder.ts";

Deno.test("LinearCircuitBuilder builds linear flow", () => {
  const agent = new ChatPromptNeuronBuilder("agent", {
    personality: "p" as PersonalityId,
  });
  const tool = new ToolNeuronBuilder("tool", "t" as ToolId);

  const details = new LinearCircuitBuilder()
    .Neuron(agent)
    .Neuron(tool)
    .Chain(agent, tool)
    .Build();

  assertEquals(details.Neurons[""], "agent");
  const agentDetails = details.Neurons["agent"] as {
    Neurons: Record<string, string>;
  };
  assertEquals(agentDetails.Neurons[""], "tool");
  assertEquals(details.Type, "Linear");
});
