import { Runnable } from "../langchain.deps.ts";
import { EaCLinearCircuitDetails } from "./EaCLinearCircuitDetails.ts";
import { EaCNeuron } from "./EaCNeuron.ts";

export function composeRunnableCircuit(
  runnable: Runnable,
  circuit: Partial<EaCLinearCircuitDetails>,
): EaCLinearCircuitDetails {
  return {
    Type: "Linear",
    ...(circuit ?? {}),
    Neurons: {
      "": composeRunnableNeuron(runnable, {}),
      ...(circuit?.Neurons ?? {}),
    },
  };
}

export function composeRunnableNeuron(
  runnable: Runnable,
  neuron: Partial<EaCNeuron>,
): EaCNeuron {
  return {
    Bootstrap: (r) => {
      return r.pipe(runnable);
    },
    ...(neuron ?? {}),
  } as Partial<EaCNeuron> as EaCNeuron;
}
