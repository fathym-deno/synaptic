import { IConversationState } from "./IConversationState.ts";

export class ConversationManager {
  constructor(protected state: IConversationState) {}
}
