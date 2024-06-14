// deno-lint-ignore-file no-explicit-any
import { EaCVertexDetails, ZodObject } from "../src.deps.ts";
import { EaCNeuronLike } from "./EaCNeuron.ts";

export type EaCCircuitDetails<TType = unknown> = {
  InputSchema?: ZodObject<any>;

  Neurons?: Record<string, EaCNeuronLike>;

  Synapses?: Record<string, EaCNeuronLike>;

  Priority: number;

  Type: TType;
} & EaCVertexDetails;

export function isEaCCircuitDetails<TType = unknown>(
  type: TType,
  details: unknown,
): details is EaCCircuitDetails {
  const x = details as EaCCircuitDetails;

  return x && (!type || x.Type === type);
}
