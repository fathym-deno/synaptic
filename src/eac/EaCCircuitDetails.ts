// deno-lint-ignore-file no-explicit-any
import {
  EaCVertexDetails,
  Runnable,
  RunnableConfig,
  ZodType,
} from '../src.deps.ts';
import { EaCNeuronLike } from './EaCNeuron.ts';

export type EaCCircuitDetails<TType = unknown> = {
  Bootstrap?: (
    runnable: Runnable,
    circuitDetails: EaCCircuitDetails<TType>
  ) => Runnable | Promise<Runnable>;

  BootstrapInput?: <TIn, TOut>(
    input: TIn,
    circuitDetails: EaCCircuitDetails<TType>,
    options?:
      | ({
          config?: RunnableConfig;
        } & RunnableConfig)
      | Record<string, any>
      | (Record<string, any> & {
          config: RunnableConfig;
        } & RunnableConfig)
  ) => TOut | Promise<TOut>;

  BootstrapOutput?: <TIn, TOut>(
    input: TIn,
    circuitDetails: EaCCircuitDetails<TType>,
    options?:
      | ({
          config?: RunnableConfig;
        } & RunnableConfig)
      | Record<string, any>
      | (Record<string, any> & {
          config: RunnableConfig;
        } & RunnableConfig)
  ) => TOut | Promise<TOut>;

  InputSchema?: ZodType<any>;

  Neurons?: Record<string, EaCNeuronLike>;

  Synapses?: Record<string, EaCNeuronLike>;

  Type: TType;
} & EaCVertexDetails;

export function isEaCCircuitDetails<TType = unknown>(
  type: TType,
  details: unknown
): details is EaCCircuitDetails {
  const x = details as EaCCircuitDetails;

  return x && (!type || x.Type === type);
}
