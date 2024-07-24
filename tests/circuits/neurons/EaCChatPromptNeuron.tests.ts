import { ChatPromptValue } from "npm:@langchain/core/prompt_values";
import { EaCLinearCircuitDetails } from "../../../src/eac/EaCLinearCircuitDetails.ts";
import { EverythingAsCodeSynaptic } from "../../../src/eac/EverythingAsCodeSynaptic.ts";
import { EaCChatPromptNeuron } from "../../../src/eac/neurons/EaCChatPromptNeuron.ts";
import FathymSynapticPlugin from "../../../src/plugins/FathymSynapticPlugin.ts";
import { buildTestIoC } from "../../test-eac-setup.ts";
import {
  AIMessage,
  assert,
  assertEquals,
  HumanMessage,
  MessagesPlaceholder,
  Runnable,
} from "../../tests.deps.ts";

Deno.test("EaCChatPromptNeuron Tests", async (t) => {
  const eac = {
    AIs: {
      test: {
        Personalities: {
          test: {
            Details: {
              SystemMessages: ["You are a friendly assistant. "],
              Instructions: [
                "Greet the user like a pirate, then switch to a British accent.",
              ],
              Messages: [new MessagesPlaceholder("Messages")],
              NewMessages: [new HumanMessage("Hi")],
            },
          },
        },
      },
    },
    Circuits: {
      [`EaCChatPromptNeuron|basic`]: {
        Details: {
          Type: "Linear",
          Neurons: {
            "": {
              Type: "ChatPrompt",
              PersonalityLookup: "test|test",
              SystemMessage: "Help the user with whatever they need. ",
              Instructions: [
                `If you don't know an answer, just say you don't know and ask clarifying questions.`,
              ],
              Messages: [new AIMessage("Welcome.")],
              NewMessages: [new AIMessage("Thanks for stopping by.")],
            } as EaCChatPromptNeuron,
          },
        } as EaCLinearCircuitDetails,
      },
    },
  } as EverythingAsCodeSynaptic;

  const { ioc } = await buildTestIoC(
    eac,
    [new FathymSynapticPlugin(true)],
    false,
  );

  await t.step("Basic Invoke", async () => {
    const circuit = await ioc.Resolve<Runnable>(
      ioc.Symbol("Circuit"),
      `EaCChatPromptNeuron|basic`,
    );

    const result: ChatPromptValue = await circuit.invoke({
      Messages: [new HumanMessage("What is crackalackin")],
    });

    assert(result);
    assertEquals(result.messages.length, 5);
    assertEquals(
      result.messages[0].content,
      `You are a friendly assistant. Help the user with whatever they need. 

Greet the user like a pirate, then switch to a British accent.

If you don't know an answer, just say you don't know and ask clarifying questions.`,
    );
    assertEquals(result.messages[1].content, "What is crackalackin");
    assertEquals(result.messages[2].content, `Welcome.`);
    assertEquals(result.messages[3].content, `Hi`);
    assertEquals(result.messages[4].content, `Thanks for stopping by.`);
  });
});
