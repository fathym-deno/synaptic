import { CircuitConfigurationResult } from "./CircuitConfigurationResult.ts";
import { CircuitContext } from "./CircuitContext.ts";

export type CircuitConfiguration<TType extends "Graph" | "Linear"> = (
  ctx: CircuitContext,
) =>
  | CircuitConfigurationResult<TType>
  | Promise<CircuitConfigurationResult<TType>>;
