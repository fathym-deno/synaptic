import { EaCChatHistoryAsCode } from "../../eac/EaCChatHistoryAsCode.ts";
import { EaCChatHistoryDetails } from "../../eac/EaCChatHistoryDetails.ts";
import { Brand, ResourceBuilder } from "./ResourceBuilder.ts";

export type ChatHistoryId = Brand<string, "ChatHistory">;

export class ChatHistoryBuilder<
  TDetails extends EaCChatHistoryDetails = EaCChatHistoryDetails,
> extends ResourceBuilder<TDetails, EaCChatHistoryAsCode, "ChatHistory"> {
  constructor(lookup: string, details: TDetails) {
    super(lookup, details);
  }

  Build(): Record<string, EaCChatHistoryAsCode> {
    return this.BuildAs();
  }
}
