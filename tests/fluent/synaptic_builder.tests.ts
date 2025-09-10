import { assert, assertEquals } from "jsr:@std/assert@1.0.6";
import { Synaptic } from "../../mod.ts";
import { ChatPromptNeuronBuilder, LLMNeuronBuilder } from "../../mod.ts";
import { LLM, Personality } from "../../mod.ts";

Deno.test("SynapticBuilder builds AIs and returns handles", () => {
  const eac = Synaptic.Builder("Core")
    .AI("Core", (ai) => {
      ai.LLM("gpt4o", { Type: "AzureOpenAI", Name: "GPT-4o" });
      ai.Personality("Employee", { SystemMessages: ["Hello"] });
    })
    .ToEaC();

  assert(eac.AIs);
  const ai = eac.AIs!["Core"];
  assert(ai);
  assert(ai.LLMs);
  assert(ai.LLMs?.gpt4o);
  assertEquals(ai.LLMs?.gpt4o?.Details.Type, "AzureOpenAI");
});

Deno.test("Builds Linear circuit referencing scoped handles", () => {
  const llmLookup = LLM("gpt4o", "Core");
  const personality = Personality("Employee", "Core");

  const eac = Synaptic.Builder("Core")
    .AI("Core", (ai) => {
      ai.LLM("gpt4o", { Type: "AzureOpenAI", Name: "GPT-4o" });
      ai.Personality("Employee", { SystemMessages: ["Hi"] });
    })
    .Circuits((c) => {
      c.Linear("unit:linear", (l) => {
        const prompt = new ChatPromptNeuronBuilder("Prompt", {
          PersonalityLookup: personality,
        });
        const llm = new LLMNeuronBuilder("LLM", llmLookup);
        l.Neuron(prompt).Neuron(llm).Chain("Prompt", "LLM");
      });
    })
    .ToEaC();

  assert(eac.Circuits);
  const circ = eac.Circuits!["unit:linear"];
  assert(circ);
  assertEquals(circ.Details.Type, "Linear");
  const neurons = circ.Details.Neurons as Record<
    string,
    { Type: string } & Record<string, unknown>
  >;
  assert(neurons["Prompt"]);
  assertEquals(neurons["Prompt"].Type, "ChatPrompt");
  assertEquals(neurons["Prompt"].PersonalityLookup as string, "Core|Employee");
  assertEquals(neurons["LLM"].LLMLookup as string, "Core|gpt4o");
});
