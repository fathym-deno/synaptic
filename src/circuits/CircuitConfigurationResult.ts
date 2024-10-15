// deno-lint-ignore-file no-explicit-any ban-types
import { EaCAIAsCode } from "../eac/EaCAIAsCode.ts";
import { EaCCircuitDetails } from "../eac/EaCCircuitDetails.ts";
import { EaCGraphCircuitDetails } from "../eac/EaCGraphCircuitDetails.ts";
import { EaCLinearCircuitDetails } from "../eac/EaCLinearCircuitDetails.ts";
import { EaCNeuronLike } from "../eac/EaCNeuron.ts";
import { Runnable, RunnableConfig } from "../src.deps.ts";

export type CircuitState<TType extends "Graph" | "Linear"> = TType extends
  "Graph" ? unknown : never;

export type CircuitConfigurationResult<
  TType extends "Graph" | "Linear",
> // TInput,
 = // TState extends TType extends 'Graph' ? unknown : never
  {
    AIaC?: EaCAIAsCode;

    $neurons?: Record<string, EaCNeuronLike>;
  } & CircuitConfigurationTypeResult<TType>;

export type CircuitConfigurationTypeResult<
  TType extends "Graph" | "Linear",
> // TInput,
 = // TState extends TType extends 'Graph' ? unknown : never
  TType extends "Graph" ? EaCGraphCircuitDetails : EaCLinearCircuitDetails;

export type CircuitConfigurationSetup<TType extends "Graph" | "Linear"> =
  & {}
  & CircuitConfigurationGraphSetup<TType>;

export type CircuitConfigurationGraphSetup<TType extends "Graph" | "Linear"> =
  TType extends "Graph" ? {} : {};

export type CircuitBootstrapOptions =
  | ({ config?: RunnableConfig } & RunnableConfig)
  | Record<string, any>
  | (Record<string, any> & { config: RunnableConfig } & RunnableConfig);

export type CircuitBootstrap<
  TType extends "Graph" | "Linear",
  TInputIn,
  TInputOut,
  TOutputIn,
  TOutputOut,
> = {
  _?: (
    runnable: Runnable,
    circuitDetails: EaCCircuitDetails<TType>,
  ) => Runnable | Promise<Runnable>;

  Input?: <TIn = TInputIn, TOut = TInputOut>(
    input: TIn,
    circuitDetails: EaCCircuitDetails<TType>,
    options?: CircuitBootstrapOptions,
  ) => TOut | Promise<TOut>;

  Output?: <TIn = TOutputIn, TOut = TOutputOut>(
    input: TIn,
    circuitDetails: EaCCircuitDetails<TType>,
    options?: CircuitBootstrapOptions,
  ) => TOut | Promise<TOut>;
};
