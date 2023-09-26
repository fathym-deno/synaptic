import { ConversationMessage } from "../conversations/ConversationMessage.ts";

export type Personality = {
  Commands?: ConversationMessage[];

  Declarations?: string[];

  Instructions?: string[];

  MaxTokens?: number;

  Messages?: ConversationMessage[];

  Temperature?: number;
};
