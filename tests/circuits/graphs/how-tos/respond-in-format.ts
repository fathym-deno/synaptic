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

// https://github.com/langchain-ai/langgraphjs/blob/main/examples/how-tos/respond-in-format.ipynb

Deno.test("Graph Respond in Format Circuits", async (t) => {
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
              ToolLookups: ["thinky|test", "thinky|response"],
            } as EaCAzureOpenAILLMDetails,
          },
        },
        Tools: {
          response: {
            Details: {
              Type: "Dynamic",
              Name: "Response",
              Description: "Respond to the user using this tool.",
              Schema: z.object({
                temperature: z.number().describe("the temperature"),
                other_notes: z
                  .string()
                  .describe("any other notes about the weather"),
              }),
              Action: () => {
                return Promise.resolve("This tool should not be called.");
              },
            } as EaCDynamicToolDetails,
          },
          test: {
            Details: {
              Type: "Dynamic",
              Name: "search",
              Description: "Call to surf the web.",
              Schema: z.object({
                query: z.string().describe("The query to use in your search."),
              }),
              Action: ({}: { query: string }) => {
                return Promise.resolve(
                  "The answer to your question lies within.",
                );
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
      rif: {
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

                if (
                  lastMessage.additional_kwargs.tool_calls[0].function.name ===
                    "Response"
                ) {
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
  } as EverythingAsCodeSynaptic & EverythingAsCodeDatabases;

  const { ioc, kvCleanup } = await buildTestIoC(eac);

  await t.step("Respond in Format Circuit", async () => {
    const circuit = await ioc.Resolve<Runnable>(ioc.Symbol("Circuit"), "rif");

    const chunk = await circuit.invoke({
      messages: [new HumanMessage(`what is the weather in sf?`)],
    });

    assert(
      chunk.messages.slice(-1)[0].additional_kwargs?.tool_calls?.[0],
      JSON.stringify(chunk),
    );

    console.log(
      chunk.messages.slice(-1)[0].additional_kwargs?.tool_calls?.[0].function
        .arguments,
    );
  });

  await kvCleanup();
});
