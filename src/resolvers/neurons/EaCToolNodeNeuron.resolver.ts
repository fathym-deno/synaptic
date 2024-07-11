import { SynapticNeuronResolver } from "../SynapticNeuronResolver.ts";
import { SynapticResolverConfiguration } from "../SynapticResolverConfiguration.ts";
import { EaCToolNodeNeuron } from "../../eac/neurons/EaCToolNodeNeuron.ts";
import { resolveTools } from "../../plugins/FathymSynapticPlugin.ts";
import { Runnable, ToolNode } from "../../src.deps.ts";

export const SynapticResolverConfig: SynapticResolverConfiguration = {
  Type: "neuron",
  NeuronType: "ToolNode",
};

export default {
  async Resolve(neuron, ioc) {
    const tools = await resolveTools(neuron.ToolLookups, ioc);

    return new ToolNode(tools) as unknown as Runnable;
  },
} as SynapticNeuronResolver<EaCToolNodeNeuron>;
