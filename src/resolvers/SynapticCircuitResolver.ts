import { EaCCircuitAsCode } from "../eac/EaCCircuitAsCode.ts";
import { EaCCircuitDetails } from "../eac/EaCCircuitDetails.ts";
import { EaCNeuron } from "../eac/EaCNeuron.ts";
import { EverythingAsCodeSynaptic } from "../eac/EverythingAsCodeSynaptic.ts";
import { IoCContainer } from "../src.deps.ts";

export type SynapticCircuitResolver<TDetails = EaCCircuitDetails> = {
  Resolve: (
    circuit: { Details?: TDetails } & EaCCircuitAsCode,
    ioc: IoCContainer,
    eac: EverythingAsCodeSynaptic,
  ) => EaCNeuron | Promise<EaCNeuron>;
};
