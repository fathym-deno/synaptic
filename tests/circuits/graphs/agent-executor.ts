// deno-lint-ignore-file no-explicit-any
import {
  AIMessage,
  Annotation,
  assert,
  assertFalse,
  assertStringIncludes,
  BaseMessage,
  END,
  EverythingAsCodeDatabases,
  HumanMessage,
  Runnable,
  RunnableLambda,
  START,
} from "../../tests.deps.ts";
import { AI_LOOKUP, buildTestIoC } from "../../test-eac-setup.ts";
import { EaCLLMNeuron } from "../../../src/eac/neurons/EaCLLMNeuron.ts";
import { EaCToolExecutorNeuron } from "../../../src/eac/neurons/EaCToolExecutorNeuron.ts";
import { EaCPullChatPromptNeuron } from "../../../src/eac/neurons/EaCPullChatPromptNeuron.ts";
import { EaCGraphCircuitDetails } from "../../../src/eac/EaCGraphCircuitDetails.ts";
import { EverythingAsCodeSynaptic } from "../../../src/eac/EverythingAsCodeSynaptic.ts";
import { EaCOpenAIFunctionsAgentNeuron } from "../../../src/eac/neurons/EaCOpenAIFunctionsAgentNeuron.ts";

// https://github.com/langchain-ai/langgraphjs/blob/main/examples/how-tos/human-in-the-loop.ipynb

Deno.test("Graph Agent Executor Circuits", async (t) => {
  const eac = {
    Circuits: {
      $neurons: {
        "thinky-llm": {
          Type: "LLM",
          LLMLookup: `${AI_LOOKUP}|thinky`,
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
      agent: {
        Details: {
          Type: "Graph",
          Priority: 100,
          State: Annotation.Root({
            input: Annotation<string>({
              reducer: (_x, y) => y,
              default: () => "",
            }),
            steps: Annotation<any[]>({
              reducer: (x, y) => x.concat(y),
              default: () => [],
            }),
            agentOutcome: Annotation<string>({
              reducer: (_x, y) => y,
              default: () => "",
            }),
          }),
          Neurons: {
            agent: {
              Type: "OpenAIFunctionsAgent",
              LLM: "thinky-llm",
              Prompt: {
                Type: "PullChatPrompt",
                Template: "hwchase17/openai-functions-agent",
              } as EaCPullChatPromptNeuron,
              ToolLookups: [`${AI_LOOKUP}|tavily`],
            } as EaCOpenAIFunctionsAgentNeuron,
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
  } as EverythingAsCodeSynaptic & EverythingAsCodeDatabases;

  const { ioc, kvCleanup } = await buildTestIoC(eac);

  await t.step("Agent Executor Circuit", async () => {
    const circuit = await ioc.Resolve<Runnable>(ioc.Symbol("Circuit"), "agent");

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
