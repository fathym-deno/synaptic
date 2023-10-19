import {
  SynapsesConfig,
  SynapticBotRuntime,
  SynapticServer,
} from "@fathym/synaptic/runtime";

export class DemoBotRuntime extends SynapticBotRuntime {}

const server = new SynapticServer({
  Port: 8100,
});

const synapsesConfigs: SynapsesConfig[] = [];

const bot = new DemoBotRuntime(synapsesConfigs);

server.Start(bot);
