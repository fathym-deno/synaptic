import { SynapticNeuronResolver } from "../SynapticNeuronResolver.ts";
import { SynapticResolverConfiguration } from "../SynapticResolverConfiguration.ts";
import {
  getPackageLogger,
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
  const logger = await getPackageLogger(import.meta);

  let neuron: EaCNeuron | undefined;

  if (neuronLike) {
    if (typeof neuronLike === "string") {
      logger.debug(`Resolving neuron like pointer '${neuronLike}'`);

      const lookup = neuronLike;

      neuronLike = eac.Circuits!.$neurons![lookup]!;

      if (!neuronLike) {
        throw new Deno.errors.NotFound(
          `Unable to locate a neuron '${lookup}' in the $neurons bank.`,
        );
      }

      return await resolveEaCNeuronFromLike(neuronLike, ioc, eac);
    } else if (Array.isArray(neuronLike)) {
      const [neuronKeyLookup, neuronOverride] = neuronLike as [
        string,
        EaCNeuron,
      ];

      logger.debug(
        `Resolving neuron like pointer '${neuronKeyLookup}' with override:`,
        neuronOverride,
      );

      const $neuron = eac.Circuits?.$neurons?.[neuronKeyLookup];

      if (!$neuron) {
        throw new Deno.errors.NotFound(
          `The neuron with lookup '${neuronKeyLookup}' could not be found in the '$neurons' collection of the EaC Circuits definition.`,
        );
      }

      neuronLike = $neuron;

      neuron = await resolveEaCNeuronFromLike(neuronLike, ioc, eac);

      if (!neuron) {
        throw new Deno.errors.NotFound(
          `Unable to locate neuron '${neuronKeyLookup}' to extend.`,
        );
      }

      const bootstraps = {
        BootstrapInput: neuron?.BootstrapInput,
        BootstrapOutput: neuron?.BootstrapOutput,
        Bootstrap: neuron?.Bootstrap,
        Configure: neuron?.Configure,
      };

      if (neuronOverride.BootstrapInput) {
        logger.debug(
          `Merging BootstrapInput override for '${neuronKeyLookup}'`,
        );

        const boot = bootstraps.BootstrapInput;

        bootstraps.BootstrapInput = boot
          ? async (input, neuron, cfg) => {
            input = await neuronOverride.BootstrapInput!(input, neuron, cfg);

            return await boot(input, neuron, cfg);
          }
          : neuronOverride.BootstrapInput;
      }

      if (neuronOverride.BootstrapOutput) {
        logger.debug(
          `Merging BootstrapOutput override for '${neuronKeyLookup}'`,
        );

        const boot = bootstraps.BootstrapOutput;

        bootstraps.BootstrapOutput = boot
          ? async (input, neuron, cfg) => {
            input = await neuronOverride.BootstrapOutput!(input, neuron, cfg);

            return await boot(input, neuron, cfg);
          }
          : neuronOverride.BootstrapOutput;
      }

      if (neuronOverride.Bootstrap) {
        logger.debug(`Merging Bootstrap override for '${neuronKeyLookup}'`);

        const boot = bootstraps.Bootstrap;

        bootstraps.Bootstrap = boot
          ? async (input, cfg) => {
            input = await neuronOverride.Bootstrap!(input, cfg);

            return await boot(input, cfg);
          }
          : neuronOverride.Bootstrap;
      }

      if (neuronOverride.Configure) {
        logger.debug(`Merging Configure override for '${neuronKeyLookup}'`);

        const boot = bootstraps.Configure;

        bootstraps.Configure = boot
          ? async (runnable, input, neuron, cfg) => {
            runnable = await neuronOverride.Configure!(
              runnable,
              input,
              neuron,
              cfg,
            );

            return await boot(runnable, input, neuron, cfg);
          }
          : neuronOverride.Configure;
      }

      logger.debug(
        `Merging neuron override for '${neuronKeyLookup}' with bootstraps`,
      );

      neuron = merge(neuron || {}, {
        ...neuronOverride,
        ...bootstraps,
      });
    } else {
      neuron = neuronLike as EaCNeuron;
    }
  }

  logger.debug(`Resolved neuron like:`, neuron);

  return neuron;
}

export default {
  async Resolve(neuronLookup, neuronLike, ioc, eac) {
    const logger = await getPackageLogger(import.meta);

    try {
      let runnable: Runnable | undefined;

      const neuron = await resolveEaCNeuronFromLike(neuronLike, ioc, eac);

      if (isEaCNeuron(undefined, neuron)) {
        logger.debug(`Resolving EaC neuron for '${neuronLookup}'`);

        const neuronResolver = await ioc.Resolve<
          SynapticNeuronResolver<typeof neuron>
        >(ioc.Symbol("SynapticNeuronResolver"), neuron.Type as string);

        const neuronsResolver = await ioc.Resolve<
          SynapticNeuronResolver<Record<string, EaCNeuronLike> | undefined>
        >(ioc.Symbol("SynapticNeuronResolver"), "$neurons");

        const configureName = (rnbl: Runnable, runName?: string) => {
          if ("withConfig" in rnbl) {
            rnbl = rnbl.withConfig({
              ...(runName ? { runName } : {}),
            });
          }

          return rnbl;
        };

        if (neuron.Type) {
          logger.debug(
            `Resolving EaC Neuron for '${neuronLookup}' of type '${neuron.Type}'`,
          );

          runnable = await neuronResolver.Resolve(
            neuronLookup,
            neuron,
            ioc,
            eac,
          );
        }

        if (!runnable) {
          runnable = new RunnablePassthrough();
        }

        const neuronType = neuron.Type?.toString();

        let baseName = neuron.Name || neuronLookup || "";

        if (neuronType) {
          baseName += ` - ${neuronType}`;
        }

        if (neuron.Configure) {
          logger.debug(`Bootstraping EaC Neuron input for '${neuronLookup}'`);

          runnable = RunnableLambda.from(async (s, cfg) => {
            const r = runnable;

            return await (neuron as EaCNeuron).Configure!(
              r!,
              s,
              neuron as EaCNeuron,
              cfg,
            );
          });
        }

        runnable = configureName(runnable, baseName || undefined);

        if (neuron.Bootstrap) {
          logger.debug(`Bootstraping EaC Neuron for '${neuronLookup}'`);

          runnable = await neuron.Bootstrap(runnable, neuron);

          runnable = configureName(runnable, `Bootstrap: ${baseName}`);
        }

        const neurons = await neuronsResolver.Resolve(
          neuronLookup,
          neuron.Neurons,
          ioc,
          eac,
        );

        if (neurons) {
          logger.debug(`Attaching Neurons to '${neuronLookup}'`);

          runnable = runnable.pipe(configureName(neurons, "Neurons"));
        }

        const synapses = await neuronsResolver.Resolve(
          neuronLookup,
          neuron.Synapses,
          ioc,
          eac,
        );

        if (synapses) {
          logger.debug(`Attaching Synapses to '${neuronLookup}'`);

          runnable = runnable.pipe(configureName(synapses, "Synapses"));
        }

        if (neuron.BootstrapOutput) {
          logger.debug(`Bootstraping EaC Neuron output for '${neuronLookup}'`);

          const bsOut = configureName(
            RunnableLambda.from(async (s, cfg) => {
              return await (neuron as EaCNeuron).BootstrapOutput!(
                s,
                neuron as EaCNeuron,
                cfg,
              );
            }),
            `BootstrapOutput: ${baseName}`,
          );

          runnable = runnable.pipe(bsOut);
        }

        if (neuron.BootstrapInput) {
          logger.debug(`Bootstraping EaC Neuron input for '${neuronLookup}'`);

          const bsInput = configureName(
            RunnableLambda.from(async (s, cfg) => {
              return await (neuron as EaCNeuron).BootstrapInput!(
                s,
                neuron as EaCNeuron,
                cfg,
              );
            }),
            `BootstrapInput: ${baseName}`,
          );

          runnable = bsInput.pipe(runnable);
        }
      }

      return runnable;
    } catch (err) {
      logger.error(
        `Unable to configure neuron ${neuronLookup} with configuration:`,
        err,
      );
      logger.error("Neuron details", neuronLike);

      throw err;
    }
  },
} as SynapticNeuronResolver<EaCNeuronLike>;
