// TODO(ttrichar): MOVE TO @fathym/eac/runtim ref after EaCRuntimePluginDef export bug is fixed
import { EverythingAsCodeSynaptic } from "../src/eac/EverythingAsCodeSynaptic.ts";
import FathymSynapticPlugin from "../src/plugins/FathymSynapticPlugin.ts";
import { eacAIsRoot, eacDatabases } from "./eacs.ts";
import {
  EaCRuntimeConfig,
  EaCRuntimePlugin,
  EaCRuntimePluginConfig,
  EaCRuntimePluginDef,
  EverythingAsCodeDatabases,
  FathymDFSFileHandlerPlugin,
  FathymEaCServicesPlugin,
  IoCContainer,
  merge,
} from "./tests.deps.ts";

export const AI_LOOKUP = "thinky";

const eac = {
  AIs: {
    [AI_LOOKUP]: {
      ...eacAIsRoot,
    },
  },
  Databases: {
    [AI_LOOKUP]: {
      ...eacDatabases,
    },
  },
  // DFS: {
  //   [AI_LOOKUP]: {
  //     ...eacDFSSynapticResolvers,
  //   },
  // },
} as EverythingAsCodeSynaptic & EverythingAsCodeDatabases;

export async function configureEaCIoC(
  ioc: IoCContainer,
  eac: EverythingAsCodeSynaptic & EverythingAsCodeDatabases,
  plugins: EaCRuntimePlugin[],
) {
  eac = merge(eac, await configurePlugins(ioc, eac, plugins));

  eac = merge(eac, await finalizePlugins(ioc, eac, plugins));

  return eac;
}

export async function configurePlugins(
  ioc: IoCContainer,
  eac: EverythingAsCodeSynaptic & EverythingAsCodeDatabases,
  plugins: EaCRuntimePluginDef[],
) {
  for (let pluginDef of plugins || []) {
    const _pluginKey = pluginDef as EaCRuntimePluginDef;

    if (Array.isArray(pluginDef)) {
      const [plugin, ...args] = pluginDef as [string, ...args: unknown[]];

      pluginDef = new (await import(plugin)).default(args) as EaCRuntimePlugin;
    }

    const pluginConfig = await pluginDef.Setup({
      Server: {},
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
  eac: EverythingAsCodeSynaptic & EverythingAsCodeDatabases,
  plugins: EaCRuntimePlugin[],
) {
  const pluginConfigs = (
    await Promise.all(
      Array.from(plugins?.values() || []).map(async (plugin) => {
        const pluginCfg = await plugin.Setup({
          Server: {},
        } as EaCRuntimeConfig);

        await plugin.Build?.(eac, ioc, pluginCfg);

        return [plugin, pluginCfg] as [typeof plugin, typeof pluginCfg];
      }),
    )
  ).reduce((acc, [plugin, pluginCfg]) => {
    acc.set(plugin, pluginCfg);

    return acc;
  }, new Map<EaCRuntimePlugin, EaCRuntimePluginConfig>());

  for (const plugin of plugins || []) {
    await plugin.AfterEaCResolved?.(eac, ioc);
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

const iocSetup = (useDefault: boolean) =>
  new Promise<{
    eac: EverythingAsCodeSynaptic & EverythingAsCodeDatabases;
    ioc: IoCContainer;
  }>((resolve) => {
    const ioc = new IoCContainer();

    if (useDefault) {
      configureEaCIoC(ioc, eac, [
        new FathymEaCServicesPlugin(),
        new FathymSynapticPlugin(),
      ]).then((eac) => resolve({ eac, ioc }));
    } else {
      resolve({ eac: {}, ioc });
    }
  });

export async function buildTestIoC(
  eac: EverythingAsCodeSynaptic & EverythingAsCodeDatabases,
  plugins: EaCRuntimePlugin[] = [
    new FathymEaCServicesPlugin(),
    new FathymSynapticPlugin(),
  ],
  useDefault = true,
) {
  if (!plugins?.length) {
    plugins.push(
      ...[new FathymEaCServicesPlugin(), new FathymSynapticPlugin()],
    );
  }

  plugins.unshift(new FathymDFSFileHandlerPlugin());

  const { eac: sEaC, ioc } = await iocSetup(useDefault);

  const testIoC = new IoCContainer();

  await ioc.CopyTo(testIoC);

  eac = await configureEaCIoC(testIoC, eac, plugins);

  eac = merge(sEaC, eac);

  return {
    eac,
    ioc: testIoC,
    kvCleanup: async () => {
      const databaseLookups = Object.keys(eac.Databases || {});

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

export async function cleanupKv(kvLookup: string, ioc: IoCContainer) {
  const kv = await ioc.Resolve(Deno.Kv, kvLookup);

  return () => kv.close();
}
