import { EverythingAsCodeSynaptic } from "../eac/EverythingAsCodeSynaptic.ts";
import { EaCAIAsCode } from "../eac/EaCAIAsCode.ts";
import { EaCCircuitAsCode } from "../eac/EaCCircuitAsCode.ts";
import { AI } from "./lookups/index.ts";
import { AIWorkspace } from "./ai/AIWorkspace.ts";
import { CircuitsWorkspace } from "./circuits/CircuitsWorkspace.ts";

export type UseDefaultsResult = Record<string, unknown>;

export class SynapticBuilder {
  protected scope: string;

  protected ais: Record<string, EaCAIAsCode> = {};

  protected circuits: Record<string, EaCCircuitAsCode> = {};

  constructor(scope?: string) {
    this.scope = scope || "Synaptic";
  }

  public AI(
    name: string,
    build: (ai: AIWorkspace) => Record<string, unknown> | void,
  ): this {
    const aiScope = AI(name, this.scope);

    const ws = new AIWorkspace(name, aiScope);

    const handles = build(ws) || {};

    const ai = ws.Build();

    if (!this.ais[name]) {
      this.ais[name] = ai;
    } else {
      // Merge additive definitions
      const current = this.ais[name];
      current.ChatHistories = {
        ...(current.ChatHistories || {}),
        ...(ai.ChatHistories || {}),
      };
      current.Embeddings = {
        ...(current.Embeddings || {}),
        ...(ai.Embeddings || {}),
      };
      current.Indexers = {
        ...(current.Indexers || {}),
        ...(ai.Indexers || {}),
      };
      current.LLMs = { ...(current.LLMs || {}), ...(ai.LLMs || {}) };
      current.Loaders = { ...(current.Loaders || {}), ...(ai.Loaders || {}) };
      current.Persistence = {
        ...(current.Persistence || {}),
        ...(ai.Persistence || {}),
      };
      current.Personalities = {
        ...(current.Personalities || {}),
        ...(ai.Personalities || {}),
      };
      current.Retrievers = {
        ...(current.Retrievers || {}),
        ...(ai.Retrievers || {}),
      };
      current.TextSplitters = {
        ...(current.TextSplitters || {}),
        ...(ai.TextSplitters || {}),
      };
      current.Tools = { ...(current.Tools || {}), ...(ai.Tools || {}) };
      current.VectorStores = {
        ...(current.VectorStores || {}),
        ...(ai.VectorStores || {}),
      };
    }

    // Expose handles via dynamic property for future composition if needed
    (this as unknown as Record<string, unknown>)[name] = handles;

    return this;
  }

  public UseDefaults(
    load: (syn: SynapticBuilder) => UseDefaultsResult | void,
  ): this {
    load(this);
    return this;
  }

  public Circuits(
    build: (c: CircuitsWorkspace) => Record<string, unknown> | void,
  ): this {
    const ws = new CircuitsWorkspace(this.scope);
    build(ws);
    const circs = ws.Build();
    // Merge additive
    this.circuits = { ...this.circuits, ...circs };
    return this;
  }

  public ToEaC(): EverythingAsCodeSynaptic {
    const AIs = Object.fromEntries(
      Object.entries(this.ais).map(([k, v]) => [
        k,
        { ...(v || {}), Details: v.Details || {} } as EaCAIAsCode,
      ]),
    );

    const Circuits = { ...(this.circuits || {}) } as Record<
      string,
      EaCCircuitAsCode
    >;

    return {
      AIs,
      Circuits,
    } as EverythingAsCodeSynaptic;
  }
}

export const Synaptic: {
  Builder(scope?: string): SynapticBuilder;
} = {
  Builder(scope?: string) {
    return new SynapticBuilder(scope);
  },
};
