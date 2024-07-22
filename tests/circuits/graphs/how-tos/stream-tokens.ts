import { AIMessageChunk } from "npm:@langchain/core/messages";
import {
  AIMessage,
  assert,
  assertFalse,
  BaseMessage,
  END,
  EverythingAsCodeDatabases,
  HumanMessage,
  Runnable,
  RunnableLambda,
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

// https://github.com/langchain-ai/langgraphjs/blob/main/examples/how-tos/stream-tokens.ipynb

Deno.test("Graph Stream Tokens Circuits", async (t) => {
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
                return Promise.resolve("Cold, with a low of 3℃");
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
          Bootstrap: (r) => {
            return RunnableLambda.from(
              async (state: { messages: Array<BaseMessage> }) => {
                const response = await r.invoke(state);

                return {
                  messages: response,
                };
              },
            );
          },
        } as EaCToolExecutorNeuron,
      },
      stream: {
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
                Bootstrap: (r) => {
                  return RunnableLambda.from(
                    async (state: { messages: BaseMessage[] }, config) => {
                      const { messages } = state;

                      const response = await r.invoke(messages, config);

                      return { messages: [response] };
                    },
                  );
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

  await t.step("Chat Stream Circuit", async () => {
    const circuit = await ioc.Resolve<Runnable>(
      ioc.Symbol("Circuit"),
      "stream",
    );

    const chunks = await circuit.streamEvents(
      {
        messages: [new HumanMessage(`Hi, I'm Mike`)],
      },
      {
        // streamMode: 'values',
        version: "v1",
      },
    );

    let content = false;
    let tool = false;

    for await (const event of chunks) {
      if (event.event === "on_llm_stream") {
        const chunk = event.data?.chunk;

        const msg = chunk.message as AIMessageChunk;

        if (msg.additional_kwargs?.tool_calls?.length) {
          console.log(msg.tool_call_chunks);
          tool = true;
        } else {
          console.log(msg.content);
          content = true;
        }
      }
    }

    assert(content);
    assertFalse(tool);
  });

  await t.step("Tool Stream Circuit", async () => {
    const circuit = await ioc.Resolve<Runnable>(
      ioc.Symbol("Circuit"),
      "stream",
    );

    const chunks = await circuit.streamEvents(
      {
        messages: [new HumanMessage(`what is the weather in sf?`)],
      },
      {
        // streamMode: 'values',
        version: "v1",
      },
    );

    let content = false;
    let tool = false;

    for await (const event of chunks) {
      if (event.event === "on_llm_stream") {
        const chunk = event.data?.chunk;

        const msg = chunk.message as AIMessageChunk;

        if (msg.additional_kwargs?.tool_calls?.length) {
          console.log(msg.additional_kwargs?.tool_calls[0]);
          tool = true;
        } else {
          console.log(msg.content);
          content = true;
        }
      }
    }

    assert(content);
    assert(tool);
  });

  await kvCleanup();
});
