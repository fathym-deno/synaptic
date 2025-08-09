import { EaCLinearCircuitDetails } from "../../eac/EaCLinearCircuitDetails.ts";
import { NeuronBuilder } from "./neurons/NeuronBuilder.ts";

export class LinearCircuitBuilder<
  TNeurons extends Record<string, NeuronBuilder<any>> = {},
> {
  #neurons: Record<string, NeuronBuilder<any>> = {};
  #sequence: string[] = [];

  Neuron<
    K extends string,
    N extends NeuronBuilder<any> & { id: K },
  >(builder: N): LinearCircuitBuilder<TNeurons & { [P in K]: N }> {
    this.#neurons[builder.id] = builder;
    return this as unknown as LinearCircuitBuilder<
      TNeurons & { [P in K]: N }
    >;
  }

  Chain<
    A extends TNeurons[keyof TNeurons],
    B extends TNeurons[keyof TNeurons],
    Rest extends TNeurons[keyof TNeurons][] = [],
  >(...nodes: [A, B, ...Rest]): this {
    this.#sequence = nodes.map((n) => n.id);
    return this;
  }

  Build(): EaCLinearCircuitDetails {
    const neurons: Record<string, any> = {};
    for (const key in this.#neurons) {
      Object.assign(neurons, this.#neurons[key].build());
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

