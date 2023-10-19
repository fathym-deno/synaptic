import { ISynapticBotRuntime } from "./ISynapticBotRuntime.ts";
import { SynapticConnection } from "./SynapticConnection.ts";

export class SynapticServer {
  constructor(protected conn: SynapticConnection) {}

  public Start(bot: ISynapticBotRuntime): Deno.Server {
    return Deno.serve(
      {
        onListen: (params) => {
          console.log(`Synaptic bot running
          http://${params.hostname}:${params.port}/`);
        },
        port: this.conn?.Port,
        hostname: this.conn?.Hostname,
      },
      this.handler(bot),
    );
  }

  protected handler(bot: ISynapticBotRuntime): Deno.ServeHandler {
    return (req) => {
      if (req.headers.get("upgrade") != "websocket") {
        return new Response(null, { status: 501 });
      }

      const { socket, response } = Deno.upgradeWebSocket(req);

      socket.addEventListener("close", (event) => {
        bot.Closed(event);
      });

      socket.addEventListener("error", (event) => {
        bot.Errored(event);
      });

      socket.addEventListener("message", (event) => {
        bot
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
        bot.Opened(event);
      });

      return response;
    };
  }
}
