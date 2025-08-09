import { EaCNeuronLike } from "../../../eac/EaCNeuron.ts";

export abstract class NeuronBuilder<TDetails extends EaCNeuronLike> {
  public readonly id: string;

  protected constructor(
    protected readonly lookup: string,
    protected readonly details: TDetails,
  ) {
    this.id = lookup;
  }

  Build(): Record<string, TDetails> {
    return { [this.lookup]: this.details };
  }
}
