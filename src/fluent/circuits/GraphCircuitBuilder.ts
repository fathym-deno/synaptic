import {
  EaCGraphCircuitDetails,
  EaCGraphCircuitEdge,
  EaCGraphCircuitEdgeLike,
} from "../../eac/EaCGraphCircuitDetails.ts";
import { StateDefinition } from "../../src.deps.ts";
import { NeuronBuilder } from "./neurons/NeuronBuilder.ts";

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
      To: <
        Target extends
          | TNeurons[keyof TNeurons]
          | TNeurons[keyof TNeurons][]
          | Record<string, TNeurons[keyof TNeurons]>
      >(
        target: Target,
        options?: Omit<EaCGraphCircuitEdge, "Node">,
      ): GraphCircuitBuilder<TNeurons> => {
        let node: string | string[] | Record<string, string>;
        if (Array.isArray(target)) {
          node = target.map((t) => t.id);
        } else if ("id" in target) {
          node = target.id;
        } else {
          node = Object.fromEntries(
            Object.entries(target).map(([k, v]) => [k, v.id]),
          );
        }

        let edge: EaCGraphCircuitEdgeLike;
        if (options || (typeof node === "object" && !Array.isArray(node))) {
          edge = { Node: node, ...options } as EaCGraphCircuitEdge;
        } else {
          edge = node;
        }

        this.#edges[fromId] = edge;
        return this;
      },
    };
  }

  Build(): EaCGraphCircuitDetails {
    const neurons: Record<string, unknown> = {};
    for (const key in this.#neurons) {
      Object.assign(neurons, this.#neurons[key].build());
    }

    return {
      Type: "Graph",
      Edges: this.#edges,
      State: this.#state,
      Neurons: neurons,
    } as EaCGraphCircuitDetails;
  }
}
