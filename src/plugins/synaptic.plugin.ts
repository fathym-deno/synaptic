import { Plugin } from "../src.deps.ts";
import { SynapticConfig } from "./SynapticConfig.ts";
import { loadAllConversationApis } from "./routes/conversation.apis.ts";

export function synapticPlugin(config: SynapticConfig) {
  const getAllConvosApiConfig = loadAllConversationApis(config);

  return {
    Plugin: {
      name: "fathym_synaptic",
      routes: [...getAllConvosApiConfig.Routes],
    } as Plugin,
    Handlers: {
      ...getAllConvosApiConfig.Handlers,
    },
  };
}
