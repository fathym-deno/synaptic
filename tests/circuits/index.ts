import {
  AIMessage,
  Annotation,
  assert,
  BaseMessage,
  BaseMessagePromptTemplateLike,
  END,
  EverythingAsCodeDenoKV,
  HumanMessage,
  MessagesPlaceholder,
  Runnable,
  RunnableLambda,
  START,
} from "../tests.deps.ts";
import { AI_LOOKUP, buildTestIoC } from "../test-eac-setup.ts";
import { EaCCircuitToolDetails } from "../../src/eac/tools/EaCCircuitToolDetails.ts";
import { EaCAzureOpenAILLMDetails } from "../../src/eac/llms/EaCAzureOpenAILLMDetails.ts";
import { EaCPassthroughNeuron } from "../../src/eac/neurons/EaCPassthroughNeuron.ts";
import { EaCChatHistoryNeuron } from "../../src/eac/neurons/EaCChatHistoryNeuron.ts";
import { EaCLLMNeuron } from "../../src/eac/neurons/EaCLLMNeuron.ts";
import { EaCChatPromptNeuron } from "../../src/eac/neurons/EaCChatPromptNeuron.ts";
import { EaCToolExecutorNeuron } from "../../src/eac/neurons/EaCToolExecutorNeuron.ts";
import { EaCPromptNeuron } from "../../src/eac/neurons/EaCPromptNeuron.ts";
import { EaCToolNeuron } from "../../src/eac/neurons/EaCToolNeuron.ts";
import { EaCStringOutputParserNeuron } from "../../src/eac/neurons/EaCStringOutputParserNeuron.ts";
import { EaCCircuitNeuron } from "../../src/eac/neurons/EaCCircuitNeuron.ts";
import { EaCGraphCircuitDetails } from "../../src/eac/EaCGraphCircuitDetails.ts";
import { EaCLinearCircuitDetails } from "../../src/eac/EaCLinearCircuitDetails.ts";
import { EaCNeuron } from "../../src/eac/EaCNeuron.ts";
import { EverythingAsCodeSynaptic } from "../../src/eac/EverythingAsCodeSynaptic.ts";
import { EaCStuffDocumentsNeuron } from "../../src/eac/neurons/EaCStuffDocumentsNeuron.ts";
import { EaCRetrieverNeuron } from "../../src/eac/neurons/EaCRetrieverNeuron.ts";
import { EaCDocumentsAsStringNeuron } from "../../src/eac/neurons/EaCDocumentsAsStringNeuron.ts";

Deno.test("Circuits", async (t) => {
  const systemMessage =
    "You are a helpful assistant named Thinky. Answer all questions to the best of your ability. Respond like a pirate. If you are asked the same question, act annoyed.";

  const baseMessages: BaseMessagePromptTemplateLike[] = [
    new AIMessage("Hello"),
    new HumanMessage("Hi, how are you feeling today?"),
    new AIMessage("Fantastic, thanks for asking."),
  ];

  const eac = {
    AIs: {
      [AI_LOOKUP]: {
        LLMs: {
          "thinky-llm-circuits": {
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
              ToolLookups: [
                "thinky|circuit-tools:chat",
                "thinky|circuit-tools:search",
              ],
              ToolsAsFunctions: true,
            } as EaCAzureOpenAILLMDetails,
          },
        },
        Retrievers: {
          fathym: {
            Details: {
              IndexerLookup: "thinky|main",
              LoaderLookups: ["thinky|fathym"],
              LoaderTextSplitterLookups: { "thinky|fathym": "thinky|html" },
              RefreshOnStart: false,
              VectorStoreLookup: "thinky|thinky",
            },
          },
        },
        Tools: {
          "circuit-tools:chat": {
            Details: {
              Type: "Circuit",
              CircuitLookup: "circuit-tools:chat",
            } as EaCCircuitToolDetails,
          },
          "circuit-tools:search": {
            Details: {
              Type: "Circuit",
              CircuitLookup: "circuit-tools:search",
            } as EaCCircuitToolDetails,
          },
        },
      },
    },
    Circuits: {
      $neurons: {
        $pass: {
          Type: "Passthrough",
        } as EaCPassthroughNeuron,
        "chat-history": {
          Type: "ChatHistory",
          ChatHistoryLookup: `${AI_LOOKUP}|thinky`,
          InputKey: "input",
          HistoryKey: "chat_history",
        } as EaCChatHistoryNeuron,
        "thinky-llm": {
          Type: "LLM",
          LLMLookup: `${AI_LOOKUP}|thinky`,
        } as EaCLLMNeuron,
        "thinky-llm-tooled": {
          Type: "LLM",
          LLMLookup: `${AI_LOOKUP}|thinky-tooled`,
        } as EaCLLMNeuron,
        "thinky-llm-circuits": {
          Type: "LLM",
          LLMLookup: `${AI_LOOKUP}|thinky-llm-circuits`,
        } as EaCLLMNeuron,
        "test-chat": {
          Type: "ChatPrompt",
          SystemMessage: systemMessage,
          Messages: baseMessages,
          Neurons: {
            "": "thinky-llm",
          },
        } as EaCChatPromptNeuron,
        "thinky-circuit-tools": {
          Type: "ToolExecutor",
          ToolLookups: [
            "thinky|circuit-tools:chat",
            "thinky|circuit-tools:search",
          ],
          ToolsAsFunctions: true,
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
      "basic-prompt": {
        Details: {
          Type: "Linear",
          Priority: 100,
          Neurons: {
            "": {
              Type: "Prompt",
              PromptTemplate: "What mood does the color {input} provoke?",
              Neurons: {
                "": "thinky-llm",
              },
            } as EaCPromptNeuron,
          },
        },
      },
      "basic-chat": {
        Details: {
          Type: "Linear",
          Priority: 100,
          Neurons: {
            "": [
              "test-chat",
              {
                NewMessages: [["human", "{input}"]],
              } as Partial<EaCChatPromptNeuron>,
            ],
          },
        },
      },
      "basic-chat-w-history": {
        Details: {
          Type: "Linear",
          Priority: 100,
          Neurons: {
            "": [
              "chat-history",
              {
                InputKey: "question",
                ChatNeuron: [
                  "test-chat",
                  {
                    NewMessages: [["human", "{question}"]],
                    Messages: [
                      ...baseMessages,
                      new MessagesPlaceholder("chat_history"),
                    ],
                  } as Partial<EaCChatPromptNeuron>,
                ],
              } as Partial<EaCChatHistoryNeuron>,
            ],
          },
        },
      },
      "rag-chat": {
        Details: {
          Type: "Linear",
          Priority: 100,
          Neurons: {
            question: "$pass",
            context: {
              Type: "Retriever",
              RetrieverLookup: "thinky|fathym",
            } as EaCRetrieverNeuron,
          },
          Synapses: {
            "": {
              Type: "StuffDocuments",
              LLM: "thinky-llm",
              Prompt: {
                Type: "ChatPrompt",
                SystemMessage:
                  `You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know. Use three sentences maximum and keep the answer concise.
Question: {question}
Context: {context}
Answer:`,
              } as EaCChatPromptNeuron,
            } as EaCStuffDocumentsNeuron,
          },
        },
      },
      "rag-chat-direct": {
        Details: {
          Type: "Linear",
          Priority: 100,
          Neurons: {
            question: "$pass",
            context: {
              Type: "Retriever",
              RetrieverLookup: "thinky|fathym",
              Neurons: {
                "": {
                  Type: "DocumentsAsString",
                } as EaCDocumentsAsStringNeuron,
              },
            } as EaCRetrieverNeuron,
          },
          Synapses: {
            "": {
              Type: "ChatPrompt",
              SystemMessage:
                `You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know. Use three sentences maximum and keep the answer concise.
Question: {question}
Context: {context}
Answer:`,
              Neurons: {
                "": "thinky-llm",
              },
            } as EaCChatPromptNeuron,
          },
        },
      },
      "tool-chat:search": {
        Details: {
          Type: "Linear",
          Priority: 100,
          Neurons: {
            input: "$pass",
          },
          Synapses: {
            input: [
              "$pass",
              {
                Field: "$.input",
              } as Partial<EaCPassthroughNeuron>,
            ],
            search: {
              Type: "ChatPrompt",
              SystemMessage: "You are an expert web researcher.",
              NewMessages: [
                [
                  "human",
                  `Turn the following user input into a search query for a search engine (just return the query, no extra quotes):
                  
{input}`,
                ],
              ],
              Neurons: {
                "": [
                  "thinky-llm",
                  {
                    Neurons: {
                      "": {
                        Type: "StringOutputParser",
                        Neurons: {
                          "": {
                            Type: "Tool",
                            ToolLookup: "thinky|tavily",
                          } as EaCToolNeuron,
                        },
                      } as EaCStringOutputParserNeuron,
                    },
                  } as Partial<EaCLLMNeuron>,
                ],
              },
            } as EaCChatPromptNeuron,
          },
        },
      },
      "tool-chat": {
        Details: {
          Type: "Linear",
          Priority: 100,
          Neurons: {
            "": {
              Type: "Circuit",
              CircuitLookup: "tool-chat:search",
              Neurons: {
                "": {
                  Type: "ChatPrompt",
                  SystemMessage:
                    `You are here to summarize the users JSON formatted web results, you will need to answer their original input:

{input}`,
                  NewMessages: [
                    [
                      "human",
                      `Please provide my answer based on:

                    {search}`,
                    ],
                  ],
                  Neurons: {
                    "": "thinky-llm",
                  },
                } as EaCChatPromptNeuron,
              },
            } as EaCCircuitNeuron,
          },
        },
      },
      "graph-chat-model": {
        Details: {
          Type: "Graph",
          Priority: 100,
          Neurons: {
            main: "thinky-llm",
          },
          Edges: {
            [START]: "main",
            main: END,
          },
        } as EaCGraphCircuitDetails,
      },
      "graph-chat-basic:agent": {
        Details: {
          Type: "Linear",
          Priority: 100,
          Neurons: {
            "": {
              Type: "ChatPrompt",
              SystemMessage: `You are a helpful assistant.`,
              Messages: [
                new MessagesPlaceholder("messages"),
              ] as BaseMessagePromptTemplateLike[],
              Neurons: {
                "": "thinky-llm-tooled",
              },
              Bootstrap: (r) => {
                return RunnableLambda.from(
                  async (state: { messages: Array<BaseMessage> }) => {
                    const { messages } = state;

                    const response = await r.invoke({ messages });

                    return {
                      messages: [response],
                    };
                  },
                );
              },
              // Synapses: {
              //   messages: '$pass',
              // },
            } as EaCChatPromptNeuron,
            // action: {},
          },
        } as EaCLinearCircuitDetails,
      },
      "graph-chat-basic:action": {
        Details: {
          Type: "Linear",
          Priority: 100,
          Neurons: {
            "": {
              Type: "ToolExecutor",
              ToolLookups: ["thinky|tavily"],
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
            // action: {},
          },
        } as EaCLinearCircuitDetails,
      },
      "graph-chat-basic": {
        Details: {
          Type: "Graph",
          Priority: 100,
          State: {
            messages: Annotation<BaseMessage[]>({
              reducer: (x, y) => x.concat(y),
              default: () => [],
            }),
          },
          Neurons: {
            agent: {
              Type: "Circuit",
              CircuitLookup: "graph-chat-basic:agent",
            } as EaCCircuitNeuron,
            action: {
              Type: "Circuit",
              CircuitLookup: "graph-chat-basic:action",
            } as EaCCircuitNeuron,
          },
          Edges: {
            [START]: "agent",
            agent: {
              Node: {
                continue: "action",
                [END]: END,
              },
              // Node: END,
              Condition: (state: { messages: Array<BaseMessage> }) => {
                const { messages } = state;

                const lastMessage = messages[messages.length - 1];

                let node = "continue";

                if (
                  (!("function_call" in lastMessage.additional_kwargs) ||
                    !lastMessage.additional_kwargs.function_call) &&
                  (!("tool_calls" in lastMessage.additional_kwargs) ||
                    !lastMessage.additional_kwargs.tool_calls)
                ) {
                  node = END;
                }

                return node;
              },
            },
            action: "agent",
          },
        } as EaCGraphCircuitDetails,
      },
      "circuit-tools:chat": {
        Details: {
          Type: "Linear",
          Name: "chat",
          Description: "Used to have an open ended chat with you.",
          Priority: 100,
          Neurons: {
            "": [
              "thinky-llm",
              {
                Neurons: {
                  "": {
                    Type: "StringOutputParser",
                  } as EaCStringOutputParserNeuron,
                },
              } as Partial<EaCNeuron>,
            ],
          },
        } as EaCLinearCircuitDetails,
      },
      "circuit-tools:search": {
        Details: {
          Type: "Linear",
          Name: "search",
          Description: "Used to search the web.",
          Priority: 100,
          Neurons: {
            "": {
              Type: "Circuit",
              CircuitLookup: "tool-chat:search",
              Neurons: {
                "": {
                  Type: "ChatPrompt",
                  SystemMessage:
                    `You are here to summarize the users JSON formatted web results, you will need to answer their original input:

{input}`,
                  NewMessages: [
                    [
                      "human",
                      `Please provide my answer based on:

                    {search}`,
                    ],
                  ],
                  Neurons: {
                    "": [
                      "thinky-llm-circuits",
                      {
                        Neurons: {
                          "": {
                            Type: "StringOutputParser",
                          } as EaCStringOutputParserNeuron,
                        },
                      } as Partial<EaCLLMNeuron>,
                    ],
                  },
                } as EaCChatPromptNeuron,
              },
            } as EaCCircuitNeuron,
          },
        } as EaCLinearCircuitDetails,
      },
      "circuit-tools": {
        Details: {
          Type: "Graph",
          Priority: 100,
          State: {
            messages: Annotation<BaseMessage[]>({
              reducer: (x, y) => x.concat(y),
              default: () => [],
            }),
          },
          Neurons: {
            agent: [
              "thinky-llm-circuits",
              {
                BootstrapOutput(msg: BaseMessage) {
                  return { messages: [msg] };
                },
              } as Partial<EaCNeuron>,
            ],
            circuits: "thinky-circuit-tools",
          },
          Edges: {
            [START]: "agent",
            agent: "circuits",
            circuits: END,
          },
        } as EaCGraphCircuitDetails,
      },
    },
  } as EverythingAsCodeSynaptic & EverythingAsCodeDenoKV;

  const { ioc, kvCleanup } = await buildTestIoC(eac);

  const sessionId = "test";

  await t.step("Basic Prompt Circuit", async () => {
    const circuit = await ioc.Resolve<Runnable>(
      ioc.Symbol("Circuit"),
      "basic-prompt",
    );

    const chunk = await circuit.invoke({
      input: "green",
    });

    assert(chunk.content, JSON.stringify(chunk));

    console.log(chunk.content);
  });

  await t.step("Basic Chat Circuit", async () => {
    const circuit = await ioc.Resolve<Runnable>(
      ioc.Symbol("Circuit"),
      "basic-chat",
    );

    const chunk = await circuit.invoke({
      input: "What is a good color to use to make someone feel happy?",
    });

    assert(chunk.content, JSON.stringify(chunk));

    console.log(chunk.content);
  });

  await t.step("Basic Chat with History Circuit", async () => {
    const circuit = await ioc.Resolve<Runnable>(
      ioc.Symbol("Circuit"),
      "basic-chat-w-history",
    );

    const chunk = await circuit.invoke(
      {
        question: "What is a good color to use to make someone feel confused?",
      },
      { configurable: { sessionId } },
    );

    console.log(chunk);

    assert(chunk.content, JSON.stringify(chunk));

    console.log(chunk.content);
  });

  await t.step("Tool Chat Circuit", async () => {
    const circuit = await ioc.Resolve<Runnable>(
      ioc.Symbol("Circuit"),
      "tool-chat",
    );

    const chunk = await circuit.invoke(
      "Who won the basketball game last night, celtics vs mavs? Provide me a summary that highlights the positive takeaways for the Mavs.",
      {
        configurable: { sessionId },
      },
    );

    assert(chunk.content, JSON.stringify(chunk));

    console.log(chunk.content);
  });

  await t.step("RAG Chat", async () => {
    const circuit = await ioc.Resolve<Runnable>(
      ioc.Symbol("Circuit"),
      "rag-chat",
    );

    const content = await circuit.invoke("Tell me about fathym?");

    assert(content, JSON.stringify(content));

    console.log(content);
  });

  await t.step("RAG Chat Direct", async () => {
    const circuit = await ioc.Resolve<Runnable>(
      ioc.Symbol("Circuit"),
      "rag-chat-direct",
    );

    const chunk = await circuit.invoke("Tell me about fathym?");

    assert(chunk.content, JSON.stringify(chunk));

    console.log(chunk.content);
  });

  await t.step("Graph Chat Model Circuit", async () => {
    const circuit = await ioc.Resolve<Runnable>(
      ioc.Symbol("Circuit"),
      "graph-chat-model",
    );

    const chunk = await circuit.invoke(
      new HumanMessage("Tell me about Circuits in 50 words or less..."),
    );

    assert(chunk.slice(-1)[0].content, JSON.stringify(chunk));

    console.log(chunk.slice(-1)[0].content);
  });

  await t.step("Graph Chat Basic Circuit", async () => {
    const circuit = await ioc.Resolve<Runnable>(
      ioc.Symbol("Circuit"),
      "graph-chat-basic",
    );

    const chunk = await circuit.invoke({
      messages: [
        new HumanMessage(
          "Who won game one of the finals between celtics and mavs?",
        ),
      ],
    });

    // assert(chunk.messages.slice(-1)[0].content, JSON.stringify(chunk));

    console.log(chunk);
    // console.log(chunk.messages.slice(-1)[0].content);
  });

  await t.step("Circuit Tools Circuit", async () => {
    const circuit = await ioc.Resolve<Runnable>(
      ioc.Symbol("Circuit"),
      "circuit-tools",
    );

    const chunk = await circuit.invoke(
      {
        messages: [
          new HumanMessage(
            "What is the NBA finals series at between celtics and mavs?",
          ),
        ],
      },
      { configurable: { sessionId } },
    );

    assert(chunk.messages.slice(-1)[0].content, JSON.stringify(chunk));

    console.log(chunk.messages.slice(-1)[0].content);
  });

  await kvCleanup();
});
