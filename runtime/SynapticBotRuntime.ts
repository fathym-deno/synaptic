import { ConversationMessage } from "../src/conversations/ConversationMessage.ts";
import { ISynapticBotRuntime } from "./ISynapticBotRuntime.ts";
import { MessageReceivedRequest } from "./MessageReceivedRequest.ts";
import { MessageReceivedResult } from "./MessageReceivedResult.ts";
import { Synapses } from "./Synapses.ts";
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
      case "converse": {
        const converseResult = await this.handleConverse(data.Data);

        result = {
          Data: JSON.stringify(converseResult.Message),
          Details: [],
          Type: data.Type,
        };

        break;
      }

      case "synapses": {
        const converseResult = await this.handleSynapses(data.Data);

        result = {
          Data: JSON.stringify(converseResult.Message),
          Details: [],
          Type: data.Type,
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
  protected handleConverse(_req: ConverseRequest): Promise<ConverseResult> {
    throw new Error();
  }

  protected handleSynapses(_synapses: Synapses): Promise<ConverseResult> {
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
