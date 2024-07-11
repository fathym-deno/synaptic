import { SynapticCircuitResolver } from "../SynapticCircuitResolver.ts";
import { SynapticResolverConfiguration } from "../SynapticResolverConfiguration.ts";
import { EaCNeuron } from "../../eac/EaCNeuron.ts";
import { EaCLinearCircuitDetails } from "../../eac/EaCLinearCircuitDetails.ts";

export const SynapticResolverConfig: SynapticResolverConfiguration = {
  Type: "circuit",
  Name: "Linear",
};

export default {
  Resolve(eacCircuit) {
    const circuitNeuron: EaCNeuron = {
      Type: undefined,
      Name: eacCircuit.Details!.Name,
      Description: eacCircuit.Details!.Description,
      Bootstrap: eacCircuit.Details!.Bootstrap,
      BootstrapInput: eacCircuit.Details!.BootstrapInput,
      BootstrapOutput: eacCircuit.Details!.BootstrapOutput,
      Synapses: eacCircuit.Details!.Synapses,
      Neurons: eacCircuit.Details!.Neurons,
    };

    return circuitNeuron;
  },
} as SynapticCircuitResolver<EaCLinearCircuitDetails>;
