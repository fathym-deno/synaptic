import { MessageReceivedRequest } from "./MessageReceivedRequest.ts";
import { MessageReceivedResult } from "./MessageReceivedResult.ts";

export interface ISynapticBotRuntime {
  Closed(event: CloseEvent): void;

  Errored(event: Event): void;

  MessageReceived(
    event: MessageEvent<MessageReceivedRequest>,
  ): Promise<MessageReceivedResult | undefined>;

  Opened(event: Event): void;
}
