import {
  StandaloneSynapticServer,
  SynapsesConfig,
  SynapticBotRuntime,
} from '@fathym/synaptic/runtime';

export class DemoBotRuntime extends SynapticBotRuntime {}

const synapsesConfigs: SynapsesConfig[] = [];

const bot = new DemoBotRuntime(synapsesConfigs);

const server = new StandaloneSynapticServer(
  {
    Port: 8100,
  },
  bot
);

server.Start();
