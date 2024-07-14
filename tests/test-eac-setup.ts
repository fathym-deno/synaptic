// TODO(ttrichar): MOVE TO @fathym/eac/runtim ref after EaCRuntimePluginDef export bug is fixed
import { EverythingAsCodeSynaptic } from "../src/eac/EverythingAsCodeSynaptic.ts";
import { buildEaCTestIoC } from "../src/testing/utils.ts";
import { eacAIsRoot, eacDatabases } from "./eacs.ts";
import {
  EaCRuntimePlugin,
  EverythingAsCodeDatabases,
  FathymEaCServicesPlugin,
} from "./tests.deps.ts";

export const AI_LOOKUP = "thinky";

const testEaC = {
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

export async function buildTestIoC(
  eac: EverythingAsCodeSynaptic & EverythingAsCodeDatabases,
  plugins: EaCRuntimePlugin[] = [new FathymEaCServicesPlugin()],
  useDefault = true,
) {
  return await buildEaCTestIoC(useDefault ? testEaC : {}, eac, plugins);
}
