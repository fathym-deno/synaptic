import { EaCChatHistoryDetails } from "../../eac/EaCChatHistoryDetails.ts";
import { EaCDetails } from "../../src.deps.ts";
import { Brand, ResourceBuilder } from "./ResourceBuilder.ts";

export type ChatHistoryId = Brand<string, "ChatHistory">;

export class ChatHistoryBuilder<
  TDetails extends EaCChatHistoryDetails = EaCChatHistoryDetails,
> extends ResourceBuilder<TDetails, EaCDetails<TDetails>, "ChatHistory"> {
  constructor(lookup: string, details: TDetails) {
    super(lookup, details);
  }

  Build(): Record<string, EaCDetails<TDetails>> {
    return this.BuildAs();
  }
}
