import { ISynapticBotRuntime } from "./ISynapticBotRuntime.ts";
import { SynapticConnection } from "./SynapticConnection.ts";
import { SynapticServer } from "./SynapticServer.ts";

export class FreshSynapticServer extends SynapticServer {
  constructor(
    protected conn: SynapticConnection,
    protected bot: ISynapticBotRuntime,
  ) {
    super(conn, bot);
  }

  public Start(): Deno.Server {
    throw new Error("Not implemented");
  }
}
