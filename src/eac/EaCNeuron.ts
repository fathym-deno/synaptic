import { EaCVertexDetails } from "../src.deps.ts";

// @ts-ignore: It is ok for the circular reference with it being a child prop with infinite nesting
export type EaCNeuronLike = EaCNeuron | string | [string, EaCNeuronLike];

export type EaCNeuron<TType = unknown> = {
  Neurons?: Record<string, EaCNeuronLike>;

  Type: TType;
} & EaCVertexDetails;

export function isEaCNeuron<TType = unknown>(
  type: TType,
  details: unknown,
): details is EaCNeuron {
  const x = details as EaCNeuron;

  return x && (!type || x.Type === type);
}
