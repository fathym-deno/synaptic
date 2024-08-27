import {
  AIMessage,
  assert,
  assertStringIncludes,
  BaseMessage,
  END,
  EverythingAsCodeDatabases,
  HumanMessage,
  Runnable,
  START,
  z,
} from "../../../tests.deps.ts";
import { AI_LOOKUP, buildTestIoC } from "../../../test-eac-setup.ts";
import { EaCAzureOpenAILLMDetails } from "../../../../src/eac/EaCAzureOpenAILLMDetails.ts";
import { EaCDynamicToolDetails } from "../../../../src/eac/tools/EaCDynamicToolDetails.ts";
import { EaCPassthroughNeuron } from "../../../../src/eac/neurons/EaCPassthroughNeuron.ts";
import { EaCLLMNeuron } from "../../../../src/eac/neurons/EaCLLMNeuron.ts";
import { EaCNeuron } from "../../../../src/eac/EaCNeuron.ts";
import { EaCToolExecutorNeuron } from "../../../../src/eac/neurons/EaCToolExecutorNeuron.ts";
import { EaCGraphCircuitDetails } from "../../../../src/eac/EaCGraphCircuitDetails.ts";

// https://github.com/langchain-ai/langgraphjs/blob/main/examples/how-tos/persistence.ipynb

Deno.test("Persistence Circuits", async (t) => {
  const eac = {
    AIs: {
      [AI_LOOKUP]: {
        LLMs: {
          "thinky-test": {
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
              ToolLookups: ["thinky|test"],
            } as EaCAzureOpenAILLMDetails,
          },
        },
        Tools: {
          test: {
            Details: {
              Type: "Dynamic",
              Name: "search",
              Description:
                "Use to surf the web, fetch current information, check the weather, and retrieve other information.",
              Schema: z.object({
                query: z.string().describe("The query to use in your search."),
              }),
              Action: ({}: { query: string }) => {
                return Promise.resolve("Cold, with a low of 13 ℃");
              },
            } as EaCDynamicToolDetails,
          },
        },
      },
    },
    Circuits: {
      // $handlers: ['esm:fathym-synaptic-resolvers'],
      $neurons: {
        $pass: {
          Type: "Passthrough",
        } as EaCPassthroughNeuron,
        "thinky-llm": {
          Type: "LLM",
          LLMLookup: `${AI_LOOKUP}|thinky-test`,
        } as EaCLLMNeuron,
        "thinky-agent": {
          Neurons: {
            "": [
              "thinky-llm",
              {
                BootstrapInput(state: { messages: BaseMessage[] }) {
                  return state.messages;
                },
                BootstrapOutput(msgs: BaseMessage[]) {
                  return { messages: msgs };
                },
              } as Partial<EaCNeuron>,
            ],
          },
        } as Partial<EaCNeuron>,
        "thinky-tools": {
          Type: "ToolExecutor",
          ToolLookups: ["thinky|test"],
          MessagesPath: "$.messages",
          BootstrapOutput(msgs: BaseMessage[]) {
            return { messages: msgs };
          },
        } as EaCToolExecutorNeuron,
      },
      "no-persist": {
        Details: {
          Type: "Graph",
          Priority: 100,
          State: {
            messages: {
              value: (x: BaseMessage[], y: BaseMessage[]) => x.concat(y),
              default: () => [],
            },
          },
          Neurons: {
            agent: "thinky-agent",
            tools: "thinky-tools",
          },
          Edges: {
            [START]: "agent",
            agent: {
              Node: {
                [END]: END,
                tools: "tools",
              },
              Condition: (state: { messages: BaseMessage[] }) => {
                const { messages } = state;

                const lastMessage = messages[messages.length - 1] as AIMessage;

                if (!lastMessage.additional_kwargs?.tool_calls?.length) {
                  return END;
                }

                return "tools";
              },
            },
            tools: "agent",
          },
        } as EaCGraphCircuitDetails,
      },
      "persist-memory": {
        Details: {
          Type: "Graph",
          Priority: 100,
          PersistenceLookup: `${AI_LOOKUP}|memory`,
          State: {
            messages: {
              value: (x: BaseMessage[], y: BaseMessage[]) => x.concat(y),
              default: () => [],
            },
          },
          Neurons: {
            agent: "thinky-agent",
            tools: "thinky-tools",
          },
          Edges: {
            [START]: "agent",
            agent: {
              Node: {
                [END]: END,
                tools: "tools",
              },
              Condition: (state: { messages: BaseMessage[] }) => {
                const { messages } = state;

                const lastMessage = messages[messages.length - 1] as AIMessage;

                if (!lastMessage.additional_kwargs?.tool_calls?.length) {
                  return END;
                }

                return "tools";
              },
            },
            tools: "agent",
          },
        } as EaCGraphCircuitDetails,
      },
      "persist-denokv": {
        Details: {
          Type: "Graph",
          Priority: 100,
          PersistenceLookup: `${AI_LOOKUP}|denokv`,
          State: {
            messages: {
              value: (x: BaseMessage[], y: BaseMessage[]) => x.concat(y),
              default: () => [],
            },
          },
          Neurons: {
            agent: "thinky-agent",
            tools: "thinky-tools",
          },
          Edges: {
            [START]: "agent",
            agent: {
              Node: {
                [END]: END,
                tools: "tools",
              },
              Condition: (state: { messages: BaseMessage[] }) => {
                const { messages } = state;

                const lastMessage = messages[messages.length - 1] as AIMessage;

                if (!lastMessage.additional_kwargs?.tool_calls?.length) {
                  return END;
                }

                return "tools";
              },
            },
            tools: "agent",
          },
        } as EaCGraphCircuitDetails,
      },
    },
  } as EverythingAsCodeDatabases;

  const { ioc, kvCleanup } = await buildTestIoC(eac);

  // await t.step('No Persist Circuit', async () => {
  //   const circuit = await ioc.Resolve<Runnable>(
  //     ioc.Symbol('Circuit'),
  //     'no-persist'
  //   );

  //   let chunk = await circuit.invoke(
  //     {
  //       messages: [new HumanMessage(`Hi I'm Mike, nice to meet you.`)],
  //     },
  //     {
  //       configurable: {
  //         thread_id: 'test',
  //       },
  //     }
  //   );

  //   assert(chunk.messages.slice(-1)[0].content, JSON.stringify(chunk));

  //   console.log(chunk.messages.slice(-1)[0].content);

  //   chunk = await circuit.invoke(
  //     {
  //       messages: [new HumanMessage(`Remember my name?`)],
  //     },
  //     {
  //       configurable: {
  //         thread_id: 'test',
  //       },
  //     }
  //   );

  //   assert(chunk.messages.slice(-1)[0].content, JSON.stringify(chunk));

  //   console.log(chunk.messages.slice(-1)[0].content);

  //   assertFalse(chunk.messages.slice(-1)[0].content.includes('Mike'));
  // });

  // await t.step('Persist Memory Circuit', async () => {
  //   const circuit = await ioc.Resolve<Runnable>(
  //     ioc.Symbol('Circuit'),
  //     'persist-memory'
  //   );

  //   let chunk = await circuit.invoke(
  //     {
  //       messages: [new HumanMessage(`Hi I'm Mike, nice to meet you.`)],
  //     },
  //     {
  //       configurable: {
  //         thread_id: 'test',
  //       },
  //     }
  //   );

  //   assert(chunk.messages.slice(-1)[0].content, JSON.stringify(chunk));

  //   console.log(chunk.messages.slice(-1)[0].content);

  //   chunk = await circuit.invoke(
  //     {
  //       messages: [new HumanMessage(`Remember my name?`)],
  //     },
  //     {
  //       configurable: {
  //         thread_id: 'test',
  //       },
  //     }
  //   );

  //   assert(chunk.messages.slice(-1)[0].content, JSON.stringify(chunk));

  //   console.log(chunk.messages.slice(-1)[0].content);

  //   assertStringIncludes(chunk.messages.slice(-1)[0].content, 'Mike');
  // });

  await t.step("Persist DenoKV Circuit", async () => {
    const circuit = await ioc.Resolve<Runnable>(
      ioc.Symbol("Circuit"),
      "persist-denokv",
    );

    let chunk = await circuit.invoke(
      {
        messages: [new HumanMessage(`Hi I'm Mike, nice to meet you.`)],
      },
      {
        configurable: {
          thread_id: "test",
        },
      },
    );

    assert(chunk.messages.slice(-1)[0].content, JSON.stringify(chunk));

    console.log(chunk.messages.slice(-1)[0].content);

    chunk = await circuit.invoke(
      {
        messages: [new HumanMessage(`Remember my name?`)],
      },
      {
        configurable: {
          thread_id: "test",
        },
      },
    );

    assert(chunk.messages.slice(-1)[0].content, JSON.stringify(chunk));

    console.log(chunk.messages.slice(-1)[0].content);

    assertStringIncludes(chunk.messages.slice(-1)[0].content, "Mike");
  });

  await t.step("Persist DenoKV ReCheck Circuit", async () => {
    const circuit = await ioc.Resolve<Runnable>(
      ioc.Symbol("Circuit"),
      "persist-denokv",
    );

    const chunk = await circuit.invoke(
      {
        messages: [new HumanMessage(`Remember my name?`)],
      },
      {
        configurable: {
          thread_id: "test",
        },
      },
    );

    assert(chunk.messages.slice(-1)[0].content, JSON.stringify(chunk));

    console.log(chunk.messages.slice(-1)[0].content);

    assertStringIncludes(chunk.messages.slice(-1)[0].content, "Mike");
  });

  await kvCleanup();
});
