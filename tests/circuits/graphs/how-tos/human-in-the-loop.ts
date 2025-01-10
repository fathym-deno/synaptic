import {
  AIMessage,
  Annotation,
  assert,
  assertFalse,
  assertStringIncludes,
  BaseMessage,
  END,
  EverythingAsCodeDenoKV,
  HumanMessage,
  Runnable,
  START,
  z,
} from "../../../tests.deps.ts";
import { AI_LOOKUP, buildTestIoC } from "../../../test-eac-setup.ts";
import { EaCAzureOpenAILLMDetails } from "../../../../src/eac/llms/EaCAzureOpenAILLMDetails.ts";
import { EaCDynamicToolDetails } from "../../../../src/eac/tools/EaCDynamicToolDetails.ts";
import { EaCPassthroughNeuron } from "../../../../src/eac/neurons/EaCPassthroughNeuron.ts";
import { EaCLLMNeuron } from "../../../../src/eac/neurons/EaCLLMNeuron.ts";
import { EaCToolExecutorNeuron } from "../../../../src/eac/neurons/EaCToolExecutorNeuron.ts";
import { EaCNeuron } from "../../../../src/synaptic/EaCNeuron.ts";
import { EaCGraphCircuitDetails } from "../../../../src/eac/EaCGraphCircuitDetails.ts";
import { EverythingAsCodeSynaptic } from "../../../../src/synaptic/EverythingAsCodeSynaptic.ts";

// https://github.com/langchain-ai/langgraphjs/blob/main/examples/how-tos/human-in-the-loop.ipynb

Deno.test("Graph Human in the Loop Circuits", async (t) => {
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
              Description: "Call to surf the web.",
              Schema: z.object({
                query: z.string().describe("The query to use in your search."),
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
      hitl: {
        Details: {
          Type: "Graph",
          Priority: 100,
          PersistenceLookup: `${AI_LOOKUP}|memory`,
          State: {
            messages: Annotation<BaseMessage[]>({
              reducer: (x, y) => x.concat(y),
              default: () => [],
            }),
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
          Interrupts: {
            Before: ["tools"],
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

                if (!lastMessage?.additional_kwargs?.tool_calls?.length) {
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
  } as EverythingAsCodeSynaptic & EverythingAsCodeDenoKV;

  const { ioc, kvCleanup } = await buildTestIoC(eac);

  await t.step("Human in the Loop Circuit", async () => {
    const circuit = await ioc.Resolve<Runnable>(ioc.Symbol("Circuit"), "hitl");

    let chunk = await circuit.invoke(
      {
        messages: [new HumanMessage(`Hi! I'm Mike`)],
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
        messages: [new HumanMessage("What did I tell you my name was?")],
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

    chunk = await circuit.invoke(
      {
        messages: [new HumanMessage(`What's the weather in sf now?`)],
      },
      {
        configurable: {
          thread_id: "test",
        },
      },
    );

    assertFalse(chunk.messages.slice(-1)[0].content, JSON.stringify(chunk));

    console.log(chunk.messages.slice(-1)[0].content);

    chunk = await circuit.invoke(null, {
      configurable: {
        thread_id: "test",
      },
    });

    assert(chunk.messages.slice(-1)[0].content, JSON.stringify(chunk));

    console.log(chunk.messages.slice(-1)[0].content);
  });

  await kvCleanup();
});
