import FathymSynapticPlugin from "../plugins/FathymSynapticPlugin.ts";
import {
  EaCApplicationsLoggingProvider,
  EaCRuntimeConfig,
  EaCRuntimePlugin,
  EaCRuntimePluginConfig,
  EaCRuntimePluginDef,
  EverythingAsCode,
  EverythingAsCodeDenoKV,
  FathymDFSFileHandlerPlugin,
  FathymEaCDenoKVPlugin,
  IoCContainer,
  LoggingProvider,
  merge,
} from "../src.deps.ts";

export async function configureEaCIoC(
  ioc: IoCContainer,
  eac: EverythingAsCode,
  plugins: EaCRuntimePlugin[],
): Promise<EverythingAsCode> {
  eac = merge(eac, await configurePlugins(ioc, eac, plugins));

  eac = merge(eac, await finalizePlugins(ioc, eac, plugins));

  return eac;
}

export async function configurePlugins(
  ioc: IoCContainer,
  eac: EverythingAsCode,
  plugins: EaCRuntimePluginDef[],
): Promise<EverythingAsCode> {
  for (let pluginDef of plugins || []) {
    const _pluginKey = pluginDef as EaCRuntimePluginDef;

    if (Array.isArray(pluginDef)) {
      const [plugin, ...args] = pluginDef as [string, ...args: unknown[]];

      pluginDef = new (await import(plugin)).default(args) as EaCRuntimePlugin;
    }

    const pluginConfig = await pluginDef.Setup({
      Servers: [{ Lookup: "" }],
    } as EaCRuntimeConfig);

    if (pluginConfig) {
      if (pluginConfig.EaC) {
        eac = merge(eac || {}, pluginConfig.EaC);
      }

      if (pluginConfig.IoC) {
        pluginConfig.IoC.CopyTo(ioc!);
      }

      // if (pluginConfig.ModifierResolvers) {
      //   this.ModifierResolvers = merge(
      //     this.ModifierResolvers || {},
      //     pluginConfig.ModifierResolvers
      //   );
      // }

      eac = merge(
        eac,
        await configurePlugins(ioc, eac, pluginConfig.Plugins || []),
      );
    }
  }

  return eac;
}

export async function finalizePlugins(
  ioc: IoCContainer,
  eac: EverythingAsCode,
  plugins: EaCRuntimePlugin[],
): Promise<EverythingAsCode> {
  const cfg = {
    Servers: [{ Lookup: "" }],
    LoggingProvider: new EaCApplicationsLoggingProvider(),
  } as EaCRuntimeConfig;

  const pluginConfigs = (
    await Promise.all(
      Array.from(plugins?.values() || []).map(async (plugin) => {
        const pluginCfg = await plugin.Setup(cfg);

        eac = merge(eac, pluginCfg.EaC ?? {});

        return [plugin, pluginCfg] as [typeof plugin, typeof pluginCfg];
      }),
    )
  ).reduce((acc, [plugin, pluginCfg]) => {
    acc.set(plugin, pluginCfg);

    return acc;
  }, new Map<EaCRuntimePlugin, EaCRuntimePluginConfig>());

  await Promise.all(
    Array.from(plugins?.values() || []).map(async (plugin) => {
      const pluginCfg = pluginConfigs.get(plugin)!;

      await plugin.Build?.(eac, ioc, pluginCfg);

      return [plugin, pluginCfg] as [typeof plugin, typeof pluginCfg];
    }),
  );

  for (const plugin of plugins || []) {
    await plugin.AfterEaCResolved?.(eac, ioc, cfg);
  }

  for (const [_plugin, pluginCfg] of pluginConfigs || []) {
    eac = merge(
      eac,
      await finalizePlugins(
        ioc,
        eac,
        (pluginCfg.Plugins as EaCRuntimePlugin[]) || [],
      ),
    );
  }

  return eac;
}

const iocSetupMap = new Map<
  EverythingAsCode,
  Promise<{
    eac: EverythingAsCode;
    ioc: IoCContainer;
  }>
>();

const iocSetup = (
  defaultEaC: EverythingAsCode,
  plugins: EaCRuntimePlugin[],
) => {
  if (defaultEaC && iocSetupMap.has(defaultEaC)) {
    return iocSetupMap.get(defaultEaC)!;
  } else {
    const is = new Promise<{
      eac: EverythingAsCode;
      ioc: IoCContainer;
    }>((resolve) => {
      const ioc = new IoCContainer();

      ioc.Register(LoggingProvider, () => new EaCApplicationsLoggingProvider());

      if (defaultEaC) {
        configureEaCIoC(ioc, defaultEaC, plugins).then((eac) =>
          resolve({ eac, ioc })
        );
      } else {
        resolve({ eac: {}, ioc });
      }
    });

    if (defaultEaC) {
      iocSetupMap.set(defaultEaC, is);

      return iocSetupMap.get(defaultEaC)!;
    } else {
      return is;
    }
  }
};

export async function buildEaCTestIoC(
  testEaC: EverythingAsCode,
  eac: EverythingAsCode & EverythingAsCodeDenoKV,
  plugins: EaCRuntimePlugin[],
  useDefaultPlugins: boolean,
): Promise<{
  eac: EverythingAsCode;
  ioc: IoCContainer;
  kvCleanup: () => Promise<void>;
}> {
  if (!plugins?.length) {
    plugins = [];
  }

  if (useDefaultPlugins) {
    if (!plugins.some((p) => p instanceof FathymEaCDenoKVPlugin)) {
      plugins.unshift(new FathymEaCDenoKVPlugin());
    }

    if (!plugins.some((p) => p instanceof FathymDFSFileHandlerPlugin)) {
      plugins.unshift(new FathymDFSFileHandlerPlugin());
    }

    if (!plugins.some((p) => p instanceof FathymSynapticPlugin)) {
      plugins.push(new FathymSynapticPlugin(true));
    }
  }

  const { eac: sEaC, ioc } = await iocSetup(testEaC, plugins);

  const testIoC = new IoCContainer();

  await ioc.CopyTo(testIoC);

  eac = await configureEaCIoC(testIoC, eac, plugins);

  eac = merge(sEaC, eac);

  return {
    eac,
    ioc: testIoC,
    kvCleanup: async () => {
      const databaseLookups = Object.keys(eac.DenoKVs || {});

      const kvs = await Promise.all(
        databaseLookups.map(async (dbLookup) => {
          return await testIoC.Resolve(Deno.Kv, dbLookup);
        }),
      );

      kvs.forEach((kv) => {
        try {
          kv.close();
        } catch {
          // Nothing to handle here
        }
      });
    },
  };
}

export async function cleanupKv(
  kvLookup: string,
  ioc: IoCContainer,
): Promise<() => void> {
  const kv = await ioc.Resolve(Deno.Kv, kvLookup);

  return () => kv.close();
}
