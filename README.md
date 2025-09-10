![Synaptic Cover](./assets/synaptic-cover.png)

# Synaptic

A Deno-first framework for building AI agents as composable circuits with strong
typing, Everything-as-Code (EaC), and a fluent builder API.

Synaptic helps you go beyond “just chat” by wiring prompt-driven neurons, tools,
memory, and state into repeatable circuits you can run across runtimes.

Status: early preview – APIs may change.

## Why Synaptic

- Strong typing: author circuits, state, and resources in TypeScript.
- Fluent builders: compose neurons and circuits without brittle JSON.
- Everything-as-Code (EaC): produce portable artifacts you can run anywhere.
- Deno-first: clean imports, npm interop, and zero build steps.
- Extensible: add tools, personalities, retrievers, vector stores, and more.

## Quick Start (Fluent API)

Define a minimal linear circuit with two prompt neurons:

```ts
// deno run -A quick-start.ts
import {
  ChatPromptNeuronBuilder,
  LinearCircuitBuilder,
} from "jsr:@fathym/synaptic/fluent";

// A prep step that summarizes input
const prep = new ChatPromptNeuronBuilder("prep", {
  Instructions: ["Summarize the user input in one short sentence."],
  Messages: [{ role: "user", content: "{input}" }],
});

// The final agent step with a distinct style
const agent = new ChatPromptNeuronBuilder("agent", {
  Instructions: ["Answer like a pirate. Keep it concise."],
});

// Chain prep -> agent into a Linear circuit
const circuit = new LinearCircuitBuilder()
  .Neuron(prep)
  .Neuron(agent)
  .Chain(prep, agent)
  .Build();

// Export as an EaC fragment you can load into a runtime
export const eac = {
  Circuits: {
    "quick-start": { Details: circuit },
  },
};
```

Next steps:

- Read the [Fluent Quick Start](docs/fluent/quick-start.mdx) for concepts and
  patterns.
- See the [Migration Guide](docs/fluent/migration-guide.mdx) to convert JSON
  circuits.

## Features

- Fluent circuit builders: `LinearCircuitBuilder`, `GraphCircuitBuilder`.
- Prompt neurons: `ChatPromptNeuronBuilder`, tool integration, and more.
- Resource builders: personalities, embeddings, retrievers, vector stores, etc.
- Typed state: build, validate, and evolve circuit state safely.
- Portable EaC output: commit and deploy circuits as code.

## Install

Use Synaptic directly from JSR in Deno:

```ts
import { fluent } from "jsr:@fathym/synaptic";
// or import specific builders
import { LinearCircuitBuilder } from "jsr:@fathym/synaptic/fluent";
```

Project uses npm interop internally (e.g., LangGraph, Preact), which Deno
resolves transparently.

## Runtimes

This package focuses on modeling and building circuits. To execute circuits, use
a compatible runtime. See `runtime/README.md` for notes and pointers.

## Development

- Format: `deno fmt`
- Lint: `deno lint`
- Type check: `deno check **/*.ts`
- Full build: `deno task build`
- Tests: `deno task test`

## Project Structure

- `src/fluent/`: fluent builders for circuits, neurons, state, and resources.
- `src/eac/`: Everything-as-Code types and validators.
- `src/circuits/`, `src/runnables/`, `src/memory/`: building blocks and
  utilities.
- `docs/fluent/`: quick start and migration guides.
- `runtime/`: notes for runtime packages that consume Synaptic.

---

We welcome feedback and issues as the API stabilizes. If you’d like a deeper
tour or have a feature request, please open an issue.
