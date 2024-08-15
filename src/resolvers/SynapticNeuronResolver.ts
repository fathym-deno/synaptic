import { EverythingAsCodeSynaptic } from "../eac/EverythingAsCodeSynaptic.ts";
import { IoCContainer, Runnable } from "../src.deps.ts";

export type SynapticNeuronResolver<TNeuron> = {
  Resolve: (
    neuronLookup: string,
    neuron: TNeuron,
    ioc: IoCContainer,
    eac: EverythingAsCodeSynaptic,
  ) => Runnable | undefined | Promise<Runnable | undefined>;
};
