import { SynapticNeuronResolver } from "../SynapticNeuronResolver.ts";
import { SynapticResolverConfiguration } from "../SynapticResolverConfiguration.ts";
import {
  IoCContainer,
  merge,
  Runnable,
  RunnableLambda,
  RunnablePassthrough,
} from "../../src.deps.ts";
import { EaCNeuron, EaCNeuronLike, isEaCNeuron } from "../../eac/EaCNeuron.ts";
import { EverythingAsCodeSynaptic } from "../../eac/EverythingAsCodeSynaptic.ts";

export const SynapticResolverConfig: SynapticResolverConfiguration = {
  Type: "neuron",
};

export async function resolveEaCNeuronFromLike(
  neuronLike: EaCNeuronLike,
  ioc: IoCContainer,
  eac: EverythingAsCodeSynaptic,
): Promise<EaCNeuron | undefined> {
  let neuron: EaCNeuron | undefined;

  if (neuronLike) {
    if (typeof neuronLike === "string") {
      const lookup = neuronLike;

      neuronLike = eac.Circuits!.$neurons![lookup];

      if (!neuronLike) {
        throw new Deno.errors.NotFound(
          `Unable to locate a neuron '${lookup}' in the $neurons bank.`,
        );
      }

      return await resolveEaCNeuronFromLike(neuronLike, ioc, eac);
    } else if (Array.isArray(neuronLike)) {
      const [neoronLookup, neuronOverride] = neuronLike as [string, EaCNeuron];

      neuronLike = eac.Circuits!.$neurons![neoronLookup];

      neuron = await resolveEaCNeuronFromLike(neuronLike, ioc, eac);

      if (!neuron) {
        throw new Deno.errors.NotFound(
          `Unable to locate neuron '${neoronLookup}' to extend.`,
        );
      }

      const bootstraps = {
        BootstrapInput: neuron?.BootstrapInput,
        BootstrapOutput: neuron?.BootstrapOutput,
        Bootstrap: neuron?.Bootstrap,
      };

      if (neuronOverride.BootstrapInput) {
        const boot = bootstraps.BootstrapInput;

        bootstraps.BootstrapInput = boot
          ? async (input, neuron, cfg) => {
            input = await boot(input, neuron, cfg);

            return await neuronOverride.BootstrapInput!(input, neuron, cfg);
          }
          : neuronOverride.BootstrapInput;
      }

      if (neuronOverride.BootstrapOutput) {
        const boot = bootstraps.BootstrapOutput;

        bootstraps.BootstrapOutput = boot
          ? async (input, neuron, cfg) => {
            input = await boot(input, neuron, cfg);

            return await neuronOverride.BootstrapOutput!(input, neuron, cfg);
          }
          : neuronOverride.BootstrapOutput;
      }

      if (neuronOverride.Bootstrap) {
        const boot = bootstraps.Bootstrap;

        bootstraps.Bootstrap = boot
          ? async (input, cfg) => {
            input = await boot(input, cfg);

            return await neuronOverride.Bootstrap!(input, cfg);
          }
          : neuronOverride.Bootstrap;
      }

      neuron = merge(neuron || {}, {
        ...neuronOverride,
        ...bootstraps,
      });
    } else {
      neuron = neuronLike as EaCNeuron;
    }
  }

  return neuron;
}

export default {
  async Resolve(neuronLike, ioc, eac) {
    let runnable: Runnable | undefined;

    const neuron = await resolveEaCNeuronFromLike(neuronLike, ioc, eac);

    if (isEaCNeuron(undefined, neuron)) {
      const neuronResolver = await ioc.Resolve<
        SynapticNeuronResolver<typeof neuron>
      >(ioc.Symbol("SynapticNeuronResolver"), neuron.Type as string);

      const neuronsResolver = await ioc.Resolve<
        SynapticNeuronResolver<Record<string, EaCNeuronLike> | undefined>
      >(ioc.Symbol("SynapticNeuronResolver"), "$neurons");

      runnable = neuron.Type
        ? await neuronResolver.Resolve(neuron, ioc, eac)
        : runnable;

      if (neuron.Bootstrap) {
        runnable = await neuron.Bootstrap(
          runnable ?? new RunnablePassthrough(),
          neuron,
        );
      }

      const neurons = await neuronsResolver.Resolve(neuron.Neurons, ioc, eac);

      if (neurons) {
        runnable = runnable ? runnable.pipe(neurons) : neurons;
      }

      const synapses = await neuronsResolver.Resolve(neuron.Synapses, ioc, eac);

      if (synapses) {
        runnable = runnable ? runnable.pipe(synapses) : synapses;
      }

      if (neuron.BootstrapInput) {
        const bsInput = RunnableLambda.from(async (s, cfg) => {
          return await (neuron as EaCNeuron).BootstrapInput!(
            s,
            neuron as EaCNeuron,
            cfg,
          );
        });

        runnable = runnable ? bsInput.pipe(runnable) : bsInput;
      }

      if (neuron.BootstrapOutput) {
        const bsOut = RunnableLambda.from(async (s, cfg) => {
          return await (neuron as EaCNeuron).BootstrapOutput!(
            s,
            neuron as EaCNeuron,
            cfg,
          );
        });

        runnable = runnable ? runnable.pipe(bsOut) : bsOut;
      }
    }

    return runnable?.withConfig({ runName: neuron?.Name || undefined });
  },
} as SynapticNeuronResolver<EaCNeuronLike>;
