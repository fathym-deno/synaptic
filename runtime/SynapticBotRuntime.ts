import { ConversationMessage } from "../src/conversations/ConversationMessage.ts";
import { ISynapticBotRuntime } from "./ISynapticBotRuntime.ts";
import { MessageReceivedRequest } from "./MessageReceivedRequest.ts";
import { MessageReceivedResult } from "./MessageReceivedResult.ts";
import { Synapses, SynapsesCommand } from "./SynapsesCommand.ts";
import { SynapsesConfig } from "./SynapsesConfig.ts";

export abstract class SynapticBotRuntime implements ISynapticBotRuntime {
  //#region Constructors
  constructor(protected synapsesConfigs: SynapsesConfig[]) {}
  //#endregion

  //#region API Methods
  public Closed(event: CloseEvent): void {
    console.log("Bot runtime closed:");
    console.log(event);
  }

  public Errored(event: Event): void {
    console.log("Bot runtime closed:");
    console.error(event);
  }

  public async MessageReceived(
    event: MessageEvent<MessageReceivedRequest>,
  ): Promise<MessageReceivedResult | undefined> {
    const { data } = event;

    let result: MessageReceivedResult | undefined = undefined;

    switch (data.Type) {
      case "synapses": {
        const synapsesResult = await this.handleSynapses(data.Data);

        result = {
          Data: JSON.stringify(synapsesResult.Message),
          Details: [],
          Type: synapsesResult.Type,
        };

        break;
      }

      default:
        result = await this.handleUnknownMessageType(data);
        break;
    }

    return result;
  }

  public Opened(event: Event): void {
    console.log("Bot runtime opened:");
    console.log(event);
  }
  //#endregion

  //#region Helpers
  protected handleSynapses(_synapses: Synapses): Promise<SynapsesCommand> {
    throw new Error();
  }

  protected handleUnknownMessageType(
    _req: MessageReceivedRequest,
  ): Promise<MessageReceivedResult> {
    throw new Error();
  }
  //#endregion
}

export type ConverseRequest = {
  Message: ConversationMessage;
};

export type ConverseResult = {
  Message: ConversationMessage;
};
