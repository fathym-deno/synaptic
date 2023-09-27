import { Conversation } from "./Conversation.ts";
import { ConversationMessage } from "./ConversationMessage.ts";

export interface IConversationState {
  Add(convoLookup: string, message: ConversationMessage): Promise<void>;

  ClearAll(): Promise<void>;

  Create(convoLookup: string, convo: Conversation): Promise<void>;

  Delete(convoLookup: string): Promise<void>;

  Get(convoLookup: string): Promise<Conversation | null>;

  GetAll(): Promise<{ [lookup: string]: Conversation }>;

  History(convoLookup: string): Promise<ConversationMessage[]>;

  Reset(convoLookup: string): Promise<void>;
}
