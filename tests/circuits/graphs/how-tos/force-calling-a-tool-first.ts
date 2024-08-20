import {
  AIMessage,
  assert,
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
import { EaCToolExecutorNeuron } from "../../../../src/eac/neurons/EaCToolExecutorNeuron.ts";
import { EaCNeuron } from "../../../../src/eac/EaCNeuron.ts";
import { EaCGraphCircuitDetails } from "../../../../src/eac/EaCGraphCircuitDetails.ts";
import { EverythingAsCodeSynaptic } from "../../../../src/eac/EverythingAsCodeSynaptic.ts";

// https://github.com/langchain-ai/langgraphjs/blob/main/examples/how-tos/force-calling-a-tool-first.ipynb

Deno.test("Graph Force Calling a Tool First Circuits", async (t) => {
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
              Endpoint: Deno.env.get("AZURE_OPENAI_ENDPOINT")!,
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
      $neurons: {
        $pass: {
          Type: "Passthrough",
        } as EaCPassthroughNeuron,
        "thinky-llm": {
          Type: "LLM",
          LLMLookup: `${AI_LOOKUP}|thinky-test`,
        } as EaCLLMNeuron,
        "thinky-tools": {
          Type: "ToolExecutor",
          ToolLookups: ["thinky|test"],
          MessagesPath: "$.messages",
          BootstrapOutput(msgs: BaseMessage[]) {
            return { messages: msgs };
          },
        } as EaCToolExecutorNeuron,
      },
      "tool-first": {
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
            agent: [
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
            first_agent: {
              BootstrapInput(state: { messages: BaseMessage[] }) {
                const humanInput =
                  state.messages[state.messages.length - 1].content || "";

                return {
                  messages: [
                    new AIMessage({
                      content: "",
                      additional_kwargs: {
                        tool_calls: [
                          {
                            id: "tool_abcd123",
                            type: "function",
                            function: {
                              name: "search",
                              arguments: JSON.stringify({
                                query: humanInput,
                              }),
                            },
                          },
                        ],
                      },
                    }),
                  ],
                };
              },
            } as Partial<EaCNeuron>,
            action: "thinky-tools",
          },
          Edges: {
            [START]: "first_agent",
            first_agent: "action",
            action: "agent",
            agent: {
              Node: {
                [END]: END,
                continue: "action",
              },
              Condition: (state: { messages: BaseMessage[] }) => {
                const { messages } = state;

                const lastMessage = messages[messages.length - 1] as AIMessage;

                if (!lastMessage.additional_kwargs.tool_calls?.length) {
                  return END;
                }

                return "continue";
              },
            },
          },
        } as EaCGraphCircuitDetails,
      },
    },
  } as EverythingAsCodeSynaptic & EverythingAsCodeDatabases;

  const { ioc, kvCleanup } = await buildTestIoC(eac);

  await t.step("Force Calling a Tool First Circuit", async () => {
    const circuit = await ioc.Resolve<Runnable>(
      ioc.Symbol("Circuit"),
      "tool-first",
    );

    const chunk = await circuit.invoke({
      messages: [new HumanMessage("what is the weather in sf?")],
    });

    assert(chunk.messages.slice(-1)[0].content, JSON.stringify(chunk));

    console.log(chunk.messages.slice(-1)[0].content);
  });

  await kvCleanup();
});
