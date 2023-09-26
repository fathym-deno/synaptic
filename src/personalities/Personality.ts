import { ConversationMessage } from '../conversations/ConversationMessage.ts';

export class Personality {
  public Commands?: ConversationMessage[];

  public Declarations?: string[];

  public Instructions?: string[];

  public MaxTokens?: number;

  public Messages?: ConversationMessage[];

  public Temperature?: number = 0.2;
}
