import { SynapticCircuitResolver } from "../SynapticCircuitResolver.ts";
import { SynapticResolverConfiguration } from "../SynapticResolverConfiguration.ts";
import { EaCNeuron } from "../../eac/EaCNeuron.ts";
import { isEaCCircuitDetails } from "../../eac/EaCCircuitDetails.ts";

export const SynapticResolverConfig: SynapticResolverConfiguration = {
  Type: "circuit",
};

export default {
  async Resolve(eacCircuit, ioc, eac) {
    let circuitNeuron: EaCNeuron = {
      Type: undefined,
      Name: eacCircuit.Details!.Name,
      Description: eacCircuit.Details!.Description,
      Bootstrap: eacCircuit.Details!.Bootstrap,
      BootstrapInput: eacCircuit.Details!.BootstrapInput,
      BootstrapOutput: eacCircuit.Details!.BootstrapOutput,
      Synapses: eacCircuit.Details!.Synapses,
    };

    if (isEaCCircuitDetails(undefined, eacCircuit.Details)) {
      const circuitResolver = await ioc.Resolve<SynapticCircuitResolver>(
        ioc.Symbol("SynapticCircuitResolver"),
        eacCircuit.Details!.Type as string,
      );

      circuitNeuron = await circuitResolver.Resolve(eacCircuit, ioc, eac);
    }

    return circuitNeuron;
  },
} as SynapticCircuitResolver;
