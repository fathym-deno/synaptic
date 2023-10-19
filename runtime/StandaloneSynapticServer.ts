import { ISynapticBotRuntime } from "./ISynapticBotRuntime.ts";
import { SynapticConnection } from "./SynapticConnection.ts";
import { SynapticServer } from "./SynapticServer.ts";

export class StandaloneSynapticServer extends SynapticServer {
  constructor(
    protected conn: SynapticConnection,
    protected bot: ISynapticBotRuntime,
  ) {
    super(conn, bot);
  }

  public Start(): Deno.Server {
    return Deno.serve(
      {
        onListen: (params) => {
          console.log(`Synaptic bot running
          http://${params.hostname}:${params.port}/`);
        },
        port: this.conn?.Port,
        hostname: this.conn?.Hostname,
      },
      this.handler,
    );
  }
}
