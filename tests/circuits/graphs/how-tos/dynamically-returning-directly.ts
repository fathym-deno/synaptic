import {
  AIMessage,
  assert,
  assertEquals,
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

// https://github.com/langchain-ai/langgraphjs/blob/main/examples/how-tos/dynamically-returning-directly.ipynb

Deno.test("Graph Dynamically Returning Directly Circuits", async (t) => {
  const itsSunnyText =
    "It's sunny in San Francisco, but you better look out if you're a Gemini 😈.";

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
              Description: "Call to surf the web.",
              Schema: z.object({
                query: z.string().describe("query to look up online"),
                return_direct: z
                  .boolean()
                  .describe(
                    "Whether or not the result of this should be returned directly to the user without you seeing what it is",
                  )
                  .default(false),
              }),
              Action: ({}: { query: string }) => {
                return Promise.resolve(itsSunnyText);
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
      drd: {
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
            final: "thinky-tools",
            tools: "thinky-tools",
          },
          Edges: {
            [START]: "agent",
            // agent: 'tools',
            // tools: END,
            agent: {
              Node: {
                [END]: END,
                final: "final",
                tools: "tools",
              },
              Condition: (state: { messages: BaseMessage[] }) => {
                const { messages } = state;

                const lastMessage = messages[messages.length - 1] as AIMessage;

                if (!lastMessage?.additional_kwargs?.tool_calls?.length) {
                  return END;
                } else {
                  const args = JSON.parse(
                    lastMessage.additional_kwargs.tool_calls[0].function
                      .arguments,
                  );

                  return args?.return_direct ? "final" : "tools";
                }
              },
            },
            tools: "agent",
            final: END,
          },
        } as EaCGraphCircuitDetails,
      },
    },
  } as EverythingAsCodeSynaptic & EverythingAsCodeDatabases;

  const { ioc, kvCleanup } = await buildTestIoC(eac);

  await t.step("Dynamically Returning Directly Circuit", async () => {
    const circuit = await ioc.Resolve<Runnable>(ioc.Symbol("Circuit"), "drd");

    let chunk = await circuit.invoke({
      messages: [new HumanMessage("what is the weather in sf?")],
    });

    assert(chunk.messages.slice(-1)[0].content, JSON.stringify(chunk));

    console.log(chunk.messages.slice(-1)[0].content);

    chunk = await circuit.invoke({
      messages: [
        new HumanMessage(
          'what is the weather in sf? return this result directly by setting return_direct = True"',
        ),
      ],
    });

    assert(chunk.messages.slice(-1)[0].content, JSON.stringify(chunk));

    console.log(chunk.messages.slice(-1)[0].content);

    assertEquals(chunk.messages.slice(-1)[0].content, itsSunnyText);
  });

  await kvCleanup();
});
