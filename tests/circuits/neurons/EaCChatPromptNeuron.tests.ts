import { EaCLinearCircuitDetails } from "../../../src/eac/EaCLinearCircuitDetails.ts";
import { EverythingAsCodeSynaptic } from "../../../src/eac/EverythingAsCodeSynaptic.ts";
import { EaCChatPromptNeuron } from "../../../src/eac/neurons/EaCChatPromptNeuron.ts";
import FathymSynapticPlugin from "../../../src/plugins/FathymSynapticPlugin.ts";
import { buildTestIoC } from "../../test-eac-setup.ts";
import {
  AIMessage,
  Annotation,
  assert,
  assertEquals,
  BaseMessage,
  delay,
  EaCDenoKVDatabaseDetails,
  END,
  HumanMessage,
  MessagesPlaceholder,
  Runnable,
  START,
  z,
} from "../../tests.deps.ts";
import { EaCGraphCircuitDetails } from "../../../src/eac/EaCGraphCircuitDetails.ts";
import { InferSynapticState } from "../../../src/utils/types.ts";
import { EaCDenoKVSaverPersistenceDetails } from "../../../src/eac/EaCDenoKVSaverPersistenceDetails.ts";
import { EaCAzureOpenAILLMDetails } from "../../../src/eac/EaCAzureOpenAILLMDetails.ts";
import { EaCLLMNeuron } from "../../../src/eac/neurons/EaCLLMNeuron.ts";

export const LovelaceSourceInformationInputSchema = z.object({
  Input: z.string().optional(),
});

export type LovelaceSourceInformationInputSchema = z.infer<
  typeof LovelaceSourceInformationInputSchema
>;

export const LovelaceSourceInformationGraphStateSchema = Annotation.Root({
  Messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
});

export type LovelaceSourceInformationGraphStateSchema = InferSynapticState<
  typeof LovelaceSourceInformationGraphStateSchema
>;

Deno.test("EaCChatPromptNeuron Tests", async (t) => {
  const eac = {
    AIs: {
      test: {
        LLMs: {
          test: {
            Details: {
              Type: "AzureOpenAI",
              Name: "Azure OpenAI LLM",
              Description: "The LLM for interacting with Azure OpenAI.",
              APIKey: Deno.env.get("AZURE_OPENAI_KEY")!,
              Instance: Deno.env.get("AZURE_OPENAI_INSTANCE")!,
              DeploymentName: "gpt-4o",
              ModelName: "gpt-4o",
              Streaming: true,
              Verbose: false,
            } as EaCAzureOpenAILLMDetails,
          },
        },
        Persistence: {
          test: {
            Details: {
              Type: "DenoKVSaver",
              DatabaseLookup: "thinky",
              RootKey: ["Thinky", "Lovelace", "SourceInformation"],
              CheckpointTTL: 1 * 1000 * 60 * 60 * 24 * 7, // 7 Days
            } as EaCDenoKVSaverPersistenceDetails,
          },
        },
        Personalities: {
          test: {
            Details: {
              SystemMessages: ["You are a friendly assistant. "],
              Instructions: [
                "Greet the user like a pirate, then switch to a British accent.",
              ],
              Messages: [new MessagesPlaceholder("Messages")],
            },
          },
        },
      },
    },
    Databases: {
      thinky: {
        Details: {
          Type: "DenoKV",
          Name: "Thinky",
          Description: "The Deno KV database to use for thinky",
          DenoKVPath: Deno.env.get("THINKY_DENO_KV_PATH") || undefined,
        } as EaCDenoKVDatabaseDetails,
      },
    },
    Circuits: {
      $neurons: {
        "test-llm": {
          Type: "LLM",
          LLMLookup: `test|test`,
        } as EaCLLMNeuron,
      },
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
      [`EaCChatPromptNeuron|graph`]: {
        Details: {
          Type: "Graph",
          InputSchema: LovelaceSourceInformationInputSchema,
          PersistenceLookup: `test|test`,
          State: LovelaceSourceInformationGraphStateSchema,
          BootstrapInput({
            Input,
          }: LovelaceSourceInformationInputSchema): LovelaceSourceInformationGraphStateSchema {
            return {
              Messages: Input ? [new HumanMessage(Input)] : [],
            };
          },
          Neurons: {
            agent: {
              Type: "ChatPrompt",
              SystemMessage: "You are a helpful assistant.",
              Instructions: [
                "Greet the user like a pirate, then switch to a British accent.",
              ],
              NewMessages: [new MessagesPlaceholder("Messages")],
              BootstrapInput(s) {
                console.log(s);
                return s;
              },
              Neurons: {
                "": "test-llm",
              },
              BootstrapOutput(
                msg: BaseMessage,
              ): LovelaceSourceInformationGraphStateSchema {
                return {
                  Messages: [msg],
                };
              },
            } as EaCChatPromptNeuron,
          },
          Edges: {
            [START]: "agent",
            agent: END,
          },
        } as EaCGraphCircuitDetails,
      },
    },
  } as EverythingAsCodeSynaptic;

  const { ioc, kvCleanup } = await buildTestIoC(
    eac,
    [new FathymSynapticPlugin(true)],
    false,
  );

  //   await t.step('Basic Invoke', async () => {
  //     const circuit = await ioc.Resolve<Runnable>(
  //       ioc.Symbol('Circuit'),
  //       `EaCChatPromptNeuron|basic`
  //     );

  //     const result: ChatPromptValue = await circuit.invoke({
  //       Messages: [new HumanMessage('What is crackalackin')],
  //     });

  //     assert(result);
  //     assertEquals(result.messages.length, 5);
  //     assertEquals(
  //       result.messages[0].content,
  //       `You are a friendly assistant. Help the user with whatever they need.

  // Greet the user like a pirate, then switch to a British accent.

  // If you don't know an answer, just say you don't know and ask clarifying questions.`
  //     );
  //     assertEquals(result.messages[1].content, 'What is crackalackin');
  //     assertEquals(result.messages[2].content, `Welcome.`);
  //     assertEquals(result.messages[3].content, `Hi`);
  //     assertEquals(result.messages[4].content, `Thanks for stopping by.`);
  //   });

  await t.step("Graph Invoke - No Input", async () => {
    const circuit = await ioc.Resolve<Runnable>(
      ioc.Symbol("Circuit"),
      `EaCChatPromptNeuron|graph`,
    );

    const result: LovelaceSourceInformationGraphStateSchema = await circuit
      .invoke(
        {
          // Input: 'What is crackalackin',
        },
        {
          configurable: {
            thread_id: crypto.randomUUID(),
            checkpoint_ns: "test",
          },
        },
      );

    assert(result);
    assertEquals(result.Messages.length, 1);

    console.log(result.Messages[0].content);
  });

  await kvCleanup();

  await delay(2500);
});
