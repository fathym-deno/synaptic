import { CircuitConfigurationResult } from "../circuits/CircuitConfigurationResult.ts";
import { Runnable } from "../langchain.deps.ts";
import { EaCLinearCircuitDetails } from "./EaCLinearCircuitDetails.ts";
import { EaCNeuron } from "./EaCNeuron.ts";

export function composeRunnableCircuit(
  runnable: Runnable,
  circuitCgf?: Partial<EaCLinearCircuitDetails>,
): CircuitConfigurationResult<"Linear"> {
  return {
    Type: "Linear",
    ...(circuitCgf ?? {}),
    Neurons: {
      "": composeRunnableNeuron(runnable, {}),
      ...(circuitCgf?.Neurons ?? {}),
    },
  };
}

export function composeRunnableNeuron(
  runnable: Runnable,
  neuron?: Partial<EaCNeuron>,
): EaCNeuron {
  return {
    Bootstrap: (r) => {
      return r.pipe(runnable);
    },
    ...(neuron ?? {}),
  } as Partial<EaCNeuron> as EaCNeuron;
}
