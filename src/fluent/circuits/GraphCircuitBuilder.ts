// deno-lint-ignore-file no-explicit-any ban-types
import {
  EaCGraphCircuitDetails,
  EaCGraphCircuitEdge,
  EaCGraphCircuitEdgeLike,
} from "../../eac/EaCGraphCircuitDetails.ts";
import { StateDefinition } from "../../src.deps.ts";
import { NeuronBuilder } from "./neurons/NeuronBuilder.ts";

type NeuronIdLike = string | { id: string };

type EdgeTarget<T extends Record<string, NeuronBuilder<any>>> =
  | string
  | T[keyof T]
  | (string | T[keyof T])[]
  | Record<string, string | T[keyof T]>;

function toNodeIds(
  target: NeuronIdLike | NeuronIdLike[] | Record<string, NeuronIdLike>,
): string | string[] | Record<string, string> {
  const toId = (n: NeuronIdLike): string => typeof n === "string" ? n : n.id;

  if (Array.isArray(target)) {
    return target.map((t) => toId(t));
  }

  if (typeof target === "object" && !("id" in target)) {
    return Object.fromEntries(
      Object.entries(target).map(([k, v]) => [k, toId(v)]),
    );
  }

  return toId(target as NeuronIdLike);
}

export class GraphCircuitBuilder<
  TNeurons extends Record<string, NeuronBuilder<any>> = {},
> {
  #state?: StateDefinition;
  #neurons: Record<string, NeuronBuilder<any>> = {};
  #edges: Record<string, EaCGraphCircuitEdgeLike> = {};

  State(state: StateDefinition): this {
    this.#state = state;
    return this;
  }

  Neuron<
    K extends string,
    N extends NeuronBuilder<any> & { id: K },
  >(builder: N): GraphCircuitBuilder<TNeurons & { [P in K]: N }> {
    this.#neurons[builder.id] = builder;
    return this as unknown as GraphCircuitBuilder<
      TNeurons & { [P in K]: N }
    >;
  }

  Edge<From extends keyof TNeurons>(from: TNeurons[From]) {
    const fromId = from.id;
    return {
      To: <Target extends EdgeTarget<TNeurons>>(
        target: Target,
        options?: Omit<EaCGraphCircuitEdge, "Node">,
      ): GraphCircuitBuilder<TNeurons> => {
        const nodeIds = toNodeIds(target);

        let edge: EaCGraphCircuitEdgeLike;
        if (
          options || (typeof nodeIds === "object" && !Array.isArray(nodeIds))
        ) {
          edge = { Node: nodeIds, ...options } as EaCGraphCircuitEdge;
        } else {
          edge = nodeIds;
        }

        this.#edges[fromId] = edge;
        return this;
      },
    };
  }

  Build(): EaCGraphCircuitDetails {
    const neurons: Record<string, unknown> = {};
    for (const key in this.#neurons) {
      Object.assign(neurons, this.#neurons[key].Build());
    }

    return {
      Type: "Graph",
      Edges: this.#edges,
      State: this.#state,
      Neurons: neurons,
    } as EaCGraphCircuitDetails;
  }
}
