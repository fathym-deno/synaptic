// deno-lint-ignore-file no-explicit-any
import { SynapticCircuitResolver } from "../SynapticCircuitResolver.ts";
import { SynapticResolverConfiguration } from "../SynapticResolverConfiguration.ts";
import {
  BaseCheckpointSaver,
  MessageGraph,
  Runnable,
  RunnableLambda,
  RunnableLike,
  StateGraph,
  StateGraphArgs,
} from "../../src.deps.ts";
import { EaCNeuron, EaCNeuronLike } from "../../eac/EaCNeuron.ts";
import {
  EaCGraphCircuitDetails,
  EaCGraphCircuitEdge,
  EaCGraphCircuitEdgeLike,
} from "../../eac/EaCGraphCircuitDetails.ts";
import { SynapticNeuronResolver } from "../SynapticNeuronResolver.ts";

export const SynapticResolverConfig: SynapticResolverConfiguration = {
  Type: "circuit",
  Name: "Graph",
};

export default {
  Resolve(eacCircuit, ioc, eac) {
    const circuitNeuron: EaCNeuron = {
      Type: undefined,
      Name: eacCircuit.Details!.Name,
      Description: eacCircuit.Details!.Description,
      Bootstrap: eacCircuit.Details!.Bootstrap,
      BootstrapInput: eacCircuit.Details!.BootstrapInput,
      BootstrapOutput: eacCircuit.Details!.BootstrapOutput,
      Synapses: eacCircuit.Details!.Synapses,
      Neurons: {
        "": {
          async Bootstrap() {
            const details = eacCircuit.Details!;

            let graph = details.State
              ? new StateGraph({
                channels: details.State as StateGraphArgs<unknown>["channels"],
              })
              : new MessageGraph();

            const neuronLookups = Object.keys(details.Neurons ?? {});

            const resolveNeuron = (
              neuronLookup: string,
              neuron: EaCNeuronLike,
            ): Runnable => {
              return RunnableLambda.from(async () => {
                const neuronResolver = await ioc.Resolve<
                  SynapticNeuronResolver<EaCNeuronLike>
                >(ioc.Symbol("SynapticNeuronResolver"));

                const runnable = await neuronResolver.Resolve(
                  neuronLookup,
                  neuron,
                  ioc,
                  eac,
                );

                return runnable;
              });
            };

            const nodes = await Promise.all(
              neuronLookups.map(async (neuronLookup) => {
                const runnable = await resolveNeuron(
                  neuronLookup,
                  details.Neurons![neuronLookup],
                );

                return [neuronLookup, runnable!] as [string, RunnableLike];
              }),
            );

            nodes.forEach(([neuronLookup, runnable]) => {
              graph = graph.addNode(neuronLookup, runnable as any) as any;
            });

            const edgeNodeLookups = Object.keys(details.Edges ?? {});

            edgeNodeLookups.forEach((edgeNodeLookup) => {
              const edgeNode: EaCGraphCircuitEdgeLike =
                details.Edges![edgeNodeLookup];

              const edgeConfigs: EaCGraphCircuitEdge[] = [];

              if (typeof edgeNode === "string") {
                edgeConfigs.push({
                  Node: edgeNode,
                });
              } else if (!Array.isArray(edgeNode)) {
                edgeConfigs.push(edgeNode as EaCGraphCircuitEdge);
              } else {
                const workingNodes = edgeNode as (
                  | string
                  | EaCGraphCircuitEdge
                )[];

                workingNodes.forEach((node) => {
                  if (typeof node === "string") {
                    edgeConfigs.push({
                      Node: node,
                    });
                  } else if (!Array.isArray(node)) {
                    edgeConfigs.push(node as EaCGraphCircuitEdge);
                  }
                });
              }

              edgeConfigs.forEach((config) => {
                if (typeof config.Node === "string") {
                  graph.addEdge(edgeNodeLookup as any, config.Node as any);
                } else {
                  graph.addConditionalEdges(
                    edgeNodeLookup as any,
                    config.Condition as any,
                    config.Node as any,
                  );
                }
              });
            });

            let checkpointer: BaseCheckpointSaver | undefined;

            if (details.PersistenceLookup) {
              checkpointer = await ioc.Resolve<BaseCheckpointSaver>(
                ioc.Symbol("Persistence"),
                details.PersistenceLookup,
              );
            }

            return graph.compile({
              checkpointer,
              interruptAfter: details.Interrupts?.After as any,
              interruptBefore: details.Interrupts?.Before as any,
            }) as unknown as Runnable;
          },
        } as Partial<EaCNeuron>,
      },
    };

    return circuitNeuron;
  },
} as SynapticCircuitResolver<EaCGraphCircuitDetails>;
