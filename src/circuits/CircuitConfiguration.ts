import { CircuitConfigurationResult } from "./CircuitConfigurationResult.ts";
import { CircuitContext } from "./CircuitContext.ts";

export type CircuitConfiguration<
  TType extends "Graph" | "Linear",
> // TInput = unknown,
 = // TState extends TType extends 'Graph' ? unknown : never = TType extends 'Graph'
  //   ? unknown
  //   : never
  (ctx: CircuitContext) => CircuitConfigurationResult<TType>;
