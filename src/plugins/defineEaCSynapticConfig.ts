import {
  EaCApplicationsLoggingProvider,
  EaCApplicationsRuntime,
  EaCRuntimeConfig,
  FathymCorePlugin,
  GenericEaCConfig,
  LoggingProvider,
  mergeWithArrays,
} from "../src.deps.ts";
import FathymSynapticPlugin from "./FathymSynapticPlugin.ts";

export async function defineEaCSynapticConfig(
  config: Partial<EaCRuntimeConfig> | Promise<Partial<EaCRuntimeConfig>>,
  loggingProvider: LoggingProvider = new EaCApplicationsLoggingProvider(),
): Promise<EaCRuntimeConfig> {
  return mergeWithArrays(
    GenericEaCConfig((cfg) => new EaCApplicationsRuntime(cfg), loggingProvider),
    {
      Plugins: [new FathymSynapticPlugin(), new FathymCorePlugin()],
    } as EaCRuntimeConfig,
    await config,
  );
}
