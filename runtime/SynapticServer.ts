import { ISynapticBotRuntime } from "./ISynapticBotRuntime.ts";
import { SynapticConnection } from "./SynapticConnection.ts";

export abstract class SynapticServer {
  constructor(
    protected conn: SynapticConnection,
    protected bot: ISynapticBotRuntime,
  ) {}

  public abstract Start(): Deno.Server;

  protected handler(req: Request): Response {
    if (req.headers.get("upgrade") != "websocket") {
      return new Response(null, { status: 501 });
    }

    const { socket, response } = Deno.upgradeWebSocket(req);

    socket.addEventListener("close", (event) => {
      this.bot.Closed(event);
    });

    socket.addEventListener("error", (event) => {
      this.bot.Errored(event);
    });

    socket.addEventListener("message", (event) => {
      this.bot
        .MessageReceived(event)
        .then((result) => {
          if (result) {
            socket.send(result.Data);

            result.Details?.forEach(socket.send);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    });

    socket.addEventListener("open", (event) => {
      this.bot.Opened(event);
    });

    return response;
  }
}
