// deno-lint-ignore-file no-explicit-any
import { EaCVertexDetails, Runnable, RunnableConfig } from "../src.deps.ts";

// @ts-ignore: It is ok for the circular reference with it being a child prop with infinite nesting
export type EaCNeuronLike =
  | EaCNeuron<any>
  | Partial<EaCNeuron<any>>
  | string
  | [string, EaCNeuronLike];

export type EaCNeuron<TType = unknown> = {
  Bootstrap?: (
    runnable: Runnable,
    neuron: EaCNeuron<TType>,
  ) => Runnable | Promise<Runnable>;

  BootstrapInput?: <TIn, TOut>(
    input: TIn,
    neuron: EaCNeuron<TType>,
    options?:
      | ({
        config?: RunnableConfig;
      } & RunnableConfig)
      | Record<string, any>
      | (Record<string, any> & {
        config: RunnableConfig;
      } & RunnableConfig),
  ) => TOut | Promise<TOut>;

  BootstrapOutput?: <TIn, TOut>(
    input: TIn,
    neuron: EaCNeuron<TType>,
    options?:
      | ({
        config?: RunnableConfig;
      } & RunnableConfig)
      | Record<string, any>
      | (Record<string, any> & {
        config: RunnableConfig;
      } & RunnableConfig),
  ) => TOut | Promise<TOut>;

  Configure?: <TIn>(
    runnable: Runnable,
    input: TIn,
    neuron: EaCNeuron<TType>,
    options?:
      | ({
        config?: RunnableConfig;
      } & RunnableConfig)
      | Record<string, any>
      | (Record<string, any> & {
        config: RunnableConfig;
      } & RunnableConfig),
  ) => Runnable | Promise<Runnable>;

  Neurons?: Record<string, EaCNeuronLike>;

  Synapses?: Record<string, EaCNeuronLike>;

  Type: TType;
} & EaCVertexDetails;

export function isEaCNeuron<TType = unknown>(
  type: TType,
  details: unknown,
): details is EaCNeuron {
  const x = details as EaCNeuron;

  return x && (!type || x.Type === type);
}
