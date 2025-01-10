import {
  Annotation,
  assert,
  assertStringIncludes,
  BaseMessage,
  BaseMessagePromptTemplateLike,
  END,
  EverythingAsCodeDenoKV,
  HumanMessage,
  MessagesPlaceholder,
  Runnable,
  START,
} from "../../../tests.deps.ts";
import { buildTestIoC } from "../../../test-eac-setup.ts";
import { EaCPassthroughNeuron } from "../../../../src/eac/neurons/EaCPassthroughNeuron.ts";
import { EaCLLMNeuron } from "../../../../src/eac/neurons/EaCLLMNeuron.ts";
import { EaCChatPromptNeuron } from "../../../../src/eac/neurons/EaCChatPromptNeuron.ts";
import { EaCNeuron } from "../../../../src/synaptic/EaCNeuron.ts";
import { EaCGraphCircuitDetails } from "../../../../src/eac/EaCGraphCircuitDetails.ts";
import { EverythingAsCodeSynaptic } from "../../../../src/synaptic/EverythingAsCodeSynaptic.ts";

// https://github.com/langchain-ai/langgraphjs/blob/main/examples/how-tos/configuration.ipynb

type ScoredValue = {
  value: string;
  score: number;
};

Deno.test("Graph Configuration Circuits", async (t) => {
  const aiLookup = "thinky";

  const userDB = {
    user1: {
      name: "John Doe",
      email: "jod@langchain.ai",
      phone: "+1234567890",
    },
    user2: {
      name: "Jane Doe",
      email: "jad@langchain.ai",
      phone: "+0987654321",
    },
  };

  const eac = {
    Circuits: {
      $neurons: {
        $pass: {
          Type: "Passthrough",
        } as EaCPassthroughNeuron,
        "thinky-llm": {
          Type: "LLM",
          LLMLookup: `${aiLookup}|thinky`,
        } as EaCLLMNeuron,
      },
      config: {
        Details: {
          Type: "Graph",
          Priority: 100,
          State: {
            messages: Annotation<BaseMessage[]>({
              reducer: (x, y) => x.concat(y),
              default: () => [],
            }),
            userInfo: Annotation<string>({
              reducer: (x, y) => {
                return y ? y : x ? x : "N/A";
              },
              default: () => "N/A",
            }),
          },
          Neurons: {
            agent: {
              Type: "ChatPrompt",
              SystemMessage:
                "You are a helpful assistant.\n\n## User Info:\n{userInfo}",
              Messages: [
                new MessagesPlaceholder("messages"),
              ] as BaseMessagePromptTemplateLike[],
              Neurons: {
                "": "thinky-llm",
              },
              BootstrapOutput(msgs: BaseMessage[]) {
                return { messages: msgs };
              },
            } as EaCChatPromptNeuron,
            "fetch-user-info": {
              BootstrapInput(_, __, config) {
                const userId = config?.configurable?.user;

                if (userId) {
                  const user = userDB[userId as keyof typeof userDB];

                  if (user) {
                    return {
                      userInfo:
                        `Name: ${user.name}\nEmail: ${user.email}\nPhone: ${user.phone}`,
                    };
                  }
                }

                return { userInfo: "N/A" };
              },
            } as Partial<EaCNeuron>,
          },
          Edges: {
            [START]: "fetch-user-info",
            ["fetch-user-info"]: "agent",
            agent: END,
          },
        } as EaCGraphCircuitDetails,
      },
    },
  } as EverythingAsCodeSynaptic & EverythingAsCodeDenoKV;

  const { ioc, kvCleanup } = await buildTestIoC(eac);

  await t.step("Configuration Circuit", async () => {
    const circuit = await ioc.Resolve<Runnable>(
      ioc.Symbol("Circuit"),
      "config",
    );

    let user = "user1";

    let chunk = await circuit.invoke(
      {
        messages: [new HumanMessage("Could you remind me of my email??")],
      },
      {
        configurable: {
          user,
        },
      },
    );

    assert(chunk.messages.slice(-1)[0].content, JSON.stringify(chunk));

    console.log(chunk.messages.slice(-1)[0].content);

    assertStringIncludes(
      chunk.messages.slice(-1)[0].content,
      userDB[user as keyof typeof userDB].email,
    );

    user = "user2";

    chunk = await circuit.invoke(
      {
        messages: [new HumanMessage("Could you remind me of my email??")],
      },
      {
        configurable: {
          user,
        },
      },
    );

    assert(chunk.messages.slice(-1)[0].content, JSON.stringify(chunk));

    console.log(chunk.messages.slice(-1)[0].content);

    assertStringIncludes(
      chunk.messages.slice(-1)[0].content,
      userDB[user as keyof typeof userDB].email,
    );
  });

  await kvCleanup();
});
