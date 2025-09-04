# Agents

Synaptic agents are composable, tool-using reasoning units built from neurons and executed inside circuits. They combine an LLM, a prompt, and a set of tools into a single Runnable you can drop into linear or graph circuits.

This repo includes a first-class OpenAI Functions Agent neuron and resolvers to wire it with your tools, prompts, memory, and persistence.

- Reference: `src/eac/neurons/EaCOpenAIFunctionsAgentNeuron.ts:1`
- Resolver: `src/resolvers/neurons/EaCOpenAIFunctionsAgentNeuron.resolver.ts:1`
- Everything-as-Code root: `src/eac/EverythingAsCodeSynaptic.ts:1`
- Plugin wiring and tool resolution: `src/plugins/FathymSynapticPlugin.ts:1`

## Core Concepts

- Agent: A neuron that orchestrates an LLM with tools and a prompt, producing decisions and tool invocations.
- Neuron: The atomic processing unit; agents, LLMs, prompts, retrievers, etc. are all neurons.
- Circuit: An arrangement of neurons into a runnable pipeline (Linear) or stateful graph (Graph) to process inputs and produce outputs.
- EaC (Everything-as-Code): Declarative configuration for AIs, tools, neurons, and circuits using plain TypeScript objects.
- IoC: The container that resolves resources (LLMs, tools, persistence) and resolvers at runtime.

## When To Use An Agent

- You need tool-calling or function-calling behavior with an LLM.
- You want a single neuron that handles prompt reasoning, selects appropriate tools, and returns a final answer.
- You want to embed that neuron inside a larger circuit, optionally with memory, retrieval, or extra steps.

## Quickstart: OpenAI Functions Agent

Define an agent neuron using EaC, then run it inside a circuit. This example uses an OpenAI-compatible model with function/tool calling and includes a simple Tavily search tool.

Prereqs:

- Set env vars for your provider, e.g. `OPENAI_API_KEY` or Azure equivalents (`AZURE_OPENAI_KEY`, `AZURE_OPENAI_INSTANCE`).
- Ensure your tools’ env vars are present (e.g. `TAVILY_API_KEY`).

Example (abbreviated) EaC config:

```ts
import { EverythingAsCodeSynaptic } from "../src/eac/EverythingAsCodeSynaptic.ts";
import { Tool } from "../src/fluent/lookups/index.ts";

export const eac: EverythingAsCodeSynaptic = {
  AIs: {
    default: {
      Details: { Name: "default" },

      // Define a simple Tavily search tool
      Tools: {
        search: {
          Details: {
            Type: "TavilySearchResults",
            // Optional fields like maxResults, includeImages, etc.
          },
        },
      },

      // Define an OpenAI (or Azure OpenAI) chat model
      LLMs: {
        openai: {
          Details: {
            Type: "OpenAI",
            Model: "gpt-4o-mini", // or your deployed model name
            Temperature: 0.2,
          },
        },
      },
    },
  },

  Circuits: {
    // Register resolvers provided by the plugin
    $resolvers: [
      "../src/resolvers/neurons/EaCOpenAIFunctionsAgentNeuron.resolver.ts",
      "../src/resolvers/circuits/EaCLinearCircuit.resolver.ts",
    ],

    // Define the circuit that runs the agent
    agent_demo: {
      Details: {
        Type: "Linear",
        Name: "Agent Demo",
        Description: "Simple agent with a search tool",
        Neurons: {
          // The agent itself
          agent: {
            Type: "OpenAIFunctionsAgent",
            LLM: ["LLM", "default|openai"],
            Prompt: {
              Type: "ChatPrompt",
              Template: [
                ["system", "You are a helpful assistant."],
                ["human", "Answer the user question. Use tools when helpful.\n{input}"],
              ],
              InputVariables: ["input"],
            },
            ToolLookups: [String(Tool("search", "default"))],
          },
        },
      },
    },
  },
};
```

To run the circuit, resolve it via the IoC container and execute like any Runnable. You can reuse test utilities during development:

```ts
import { buildEaCTestIoC } from "../src/testing/utils.ts";
import FathymSynapticPlugin from "../src/plugins/FathymSynapticPlugin.ts";

const { eac: resolved, ioc } = await buildEaCTestIoC(
  {},
  eac,
  [new FathymSynapticPlugin()],
  true,
);

const circuitResolver = await ioc.Resolve(
  (await import("../src/resolvers/SynapticCircuitResolver.ts")).SynapticCircuitResolver,
);

const circuit = await circuitResolver.Resolve(resolved.Circuits!.agent_demo, ioc, resolved);
const runnable = await circuit.Bootstrap?.(undefined as any, circuit);

const result = await (runnable as any).invoke({ input: "What’s the weather in Paris?" });
console.log(result);
```

## Anatomy Of The OpenAI Functions Agent

- Type: `OpenAIFunctionsAgent` neuron
  - Definition: `src/eac/neurons/EaCOpenAIFunctionsAgentNeuron.ts:1`
  - Resolver: `src/resolvers/neurons/EaCOpenAIFunctionsAgentNeuron.resolver.ts:1`
- Fields:
  - `LLM`: Any valid LLM neuron (OpenAI, Azure OpenAI, WatsonX, etc.).
  - `Prompt`: A chat or text prompt neuron.
  - `ToolLookups`: IoC lookups for tools defined under the AI scope.
- Behavior:
  - The resolver builds `createOpenAIFunctionsAgent(...)` with the specified LLM, prompt, and tools, returning a LangChain Runnable ready to place in circuits.

## Tools, Personalities, And Memory

- Tools
  - Define under `AIs.<ai>.Tools` and reference via `Tool(<lookup>, <ai-scope>)`.
  - Supported examples include dynamic tools, circuit tools, Serp/Tavily, and remote circuits.
- Personality
  - Capture role, tone, and guardrails using `EaCPersonalityDetails` and reference in prompts if desired.
  - File: `src/eac/EaCPersonalityDetails.ts:1`
- Memory & Persistence
  - Chat history: Deno KV-backed chat history and savers are available to persist traces and state.
  - Examples: `src/memory/DenoKVChatMessageHistory.ts:1`, `src/memory/DenoKVSaver.ts:1`
  - Graph circuits support checkpointing via `PersistenceLookup`.

## Circuits: Linear vs Graph

- Linear
  - Straight pipeline of neurons. Great for simple agent calls and classic RAG.
  - Resolver: `src/resolvers/circuits/EaCLinearCircuit.resolver.ts:1`
- Graph
  - Stateful branching, interrupts, and checkpointing.
  - Define nodes in `Details.Neurons` and edges/conditions in `Details.Edges`.
  - Resolver: `src/resolvers/circuits/EaCGraphCircuit.resolver.ts:1`

Tip: You can drop an agent neuron into either style. For quick experiments, consider wrapping any existing Runnable as a neuron using `composeRunnableNeuron` or a single-node circuit with `composeRunnableCircuit`.

- Utilities: `src/eac/composeRunnableCircuit.ts:1`

## Environment & Configuration

- OpenAI or Azure OpenAI
  - `OPENAI_API_KEY` or `AZURE_OPENAI_KEY`/`AZURE_OPENAI_INSTANCE`
- Search Tools
  - `TAVILY_API_KEY` or provider-specific variables
- Deno KV
  - `EAC_DENO_KV_PATH` and any additional KV paths used for caching/history
- LangSmith (optional)
  - `LANGCHAIN_API_KEY`, `LANGCHAIN_ENDPOINT`, `LANGCHAIN_PROJECT`

Permissions/Tasks

- See `deno.jsonc:1` for tasks like `deno task test` and lint/format.

## Best Practices

- Keep the agent prompt concise and explicit about when to use tools.
- Add one tool at a time and test; reduce toolset to just what’s needed.
- Use personalities for reusable tone/role and reference from prompts.
- Start linear; move to a graph circuit only when branching/state is required.
- Persist chat history and checkpoints for reliability and observability.

## Troubleshooting

- Tool not found: Ensure the tool is defined under the same AI scope and referenced with `Tool(lookup, scope)`.
- Resolver missing: Confirm the resolver paths are included in `Circuits.$resolvers`.
- Auth errors: Verify provider env vars are set and available at runtime.
- Graph state issues: Provide `Details.State` and/or `PersistenceLookup` when using graph circuits with checkpoints.

## Next Steps

- Add retrieval with a vector store and plug into your agent.
- Move your agent into a graph circuit with branching.
- Instrument with LangSmith and persist history using Deno KV.

