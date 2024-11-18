// TODO(ttrichar): MOVE TO @fathym/eac/runtim ref after EaCRuntimePluginDef export bug is fixed
import { EverythingAsCodeSynaptic } from "../src/eac/EverythingAsCodeSynaptic.ts";
import FathymSynapticPlugin from "../src/plugins/FathymSynapticPlugin.ts";
import { buildEaCTestIoC } from "../src/testing/utils.ts";
import { eacAIsRoot, eacDenoKVs } from "./eacs.ts";
import {
  EaCRuntimePlugin,
  EverythingAsCodeDenoKV,
  FathymEaCServicesPlugin,
} from "./tests.deps.ts";

export const AI_LOOKUP = "thinky";

const testEaC = {
  AIs: {
    [AI_LOOKUP]: {
      ...eacAIsRoot,
    },
  },
  DenoKVs: {
    [AI_LOOKUP]: {
      ...eacDenoKVs,
    },
  },
  // DFS: {
  //   [AI_LOOKUP]: {
  //     ...eacDFSSynapticResolvers,
  //   },
  // },
} as EverythingAsCodeSynaptic & EverythingAsCodeDenoKV;

export async function buildTestIoC(
  eac: EverythingAsCodeSynaptic & EverythingAsCodeDenoKV,
  plugins: EaCRuntimePlugin[] = [
    new FathymEaCServicesPlugin(),
    new FathymSynapticPlugin(true),
  ],
  useDefault = true,
  useDefaultPlugins = true,
) {
  return await buildEaCTestIoC(
    useDefault ? testEaC : {},
    eac,
    plugins,
    useDefaultPlugins,
  );
}
