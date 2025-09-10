// deno-lint-ignore-file no-explicit-any ban-types
import { EaCLinearCircuitDetails } from "../../eac/EaCLinearCircuitDetails.ts";
import { NeuronBuilder } from "./neurons/NeuronBuilder.ts";

export class LinearCircuitBuilder<
  TNeurons extends Record<string, NeuronBuilder<any>> = {},
> {
  #neurons: Record<string, NeuronBuilder<any>> = {};
  #sequence: string[] = [];

  Neuron<K extends string, N extends NeuronBuilder<any> & { id: K }>(
    builder: N,
  ): LinearCircuitBuilder<TNeurons & { [P in K]: N }> {
    this.#neurons[builder.id] = builder;
    return this as unknown as LinearCircuitBuilder<TNeurons & { [P in K]: N }>;
  }

  // Typed chain using neuron instances
  Chain<
    A extends TNeurons[keyof TNeurons],
    B extends TNeurons[keyof TNeurons],
    Rest extends TNeurons[keyof TNeurons][] = [],
  >(...nodes: [A, B, ...Rest]): this;
  // Simpler chain by ids to avoid inference issues
  Chain(...ids: [string, string, ...string[]]): this;
  Chain(
    ...nodesOrIds: Array<NeuronBuilder<any> | string>
  ): this {
    this.#sequence = nodesOrIds.map((n) =>
      typeof n === "string" ? n : (n as NeuronBuilder<any>).id
    );
    return this;
  }

  Build(): EaCLinearCircuitDetails {
    const neurons: Record<string, any> = {};
    for (const key in this.#neurons) {
      Object.assign(neurons, this.#neurons[key].Build());
    }

    if (this.#sequence.length) {
      neurons[""] = this.#sequence[0];
      for (let i = 0; i < this.#sequence.length - 1; i++) {
        const from = this.#sequence[i];
        const to = this.#sequence[i + 1];
        const detail = neurons[from] as Record<string, unknown>;
        detail.Neurons = { "": to };
      }
    }

    return {
      Type: "Linear",
      Neurons: neurons,
    } as EaCLinearCircuitDetails;
  }
}
