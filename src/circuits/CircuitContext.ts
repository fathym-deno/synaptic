import { EverythingAsCodeSynaptic } from "../synaptic/EverythingAsCodeSynaptic.ts";
import { EverythingAsCode, IoCContainer } from "../src.deps.ts";

export type CircuitContext = {
  AIaCLookup: (lookup: string, scope?: string) => string;

  CircuitLookup: string;

  EaC: EverythingAsCodeSynaptic & EverythingAsCode;

  IoC: IoCContainer;
};
