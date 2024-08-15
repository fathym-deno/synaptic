import { SynapticNeuronResolver } from "../SynapticNeuronResolver.ts";
import { SynapticResolverConfiguration } from "../SynapticResolverConfiguration.ts";
import { EaCToolNeuron } from "../../eac/neurons/EaCToolNeuron.ts";
import { resolveTools } from "../../plugins/FathymSynapticPlugin.ts";

export const SynapticResolverConfig: SynapticResolverConfiguration = {
  Type: "neuron",
  Name: "Tool",
};

export default {
  async Resolve(_neuronLookup, neuron, ioc) {
    const tools = await resolveTools([neuron.ToolLookup], ioc);

    return tools[0];
  },
} as SynapticNeuronResolver<EaCToolNeuron>;
