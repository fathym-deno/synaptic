import { Conversation } from "./Conversation.ts";
import { ConversationMessage } from "./ConversationMessage.ts";
import { IConversationState } from "./IConversationState.ts";

export class DenoKVConversationState implements IConversationState {
  constructor(
    protected kv: Deno.Kv,
    protected convoRoot = ["Conversation"],
    protected convosRoot = ["Conversations"],
    protected messageRoot = ["Messages"],
  ) {}

  public async Add(
    convoLookup: string,
    message: ConversationMessage,
  ): Promise<void> {
    const msgId = crypto.randomUUID().toString();

    message.Timestamp = message.Timestamp || new Date();

    await this.kv.set(
      [...this.convosRoot, convoLookup, ...this.messageRoot, msgId],
      message,
    );
  }

  public async ClearAll(): Promise<void> {
    const convos = await this.kv.list({
      prefix: this.convoRoot,
    });

    for await (const convo of convos) {
      const { key } = convo;

      await this.kv.delete(key);
    }

    const convoMsgs = await this.kv.list({
      prefix: this.convosRoot,
    });

    for await (const message of convoMsgs) {
      const { key } = message;

      await this.kv.delete(key);
    }
  }

  public async Create(convoLookup: string, convo: Conversation): Promise<void> {
    await this.kv.set([...this.convoRoot, convoLookup], convo);
  }

  public async Delete(convoLookup: string): Promise<void> {
    await this.Reset(convoLookup);

    await this.kv.delete([...this.convoRoot, convoLookup]);
  }

  public async Get(convoLookup: string): Promise<Conversation | null> {
    const result = await this.kv.get<Conversation>([
      ...this.convoRoot,
      convoLookup,
    ]);

    return result.value;
  }

  public async GetAll(): Promise<{ [lookup: string]: Conversation }> {
    const convos = await this.kv.list({
      prefix: [...this.convoRoot],
    });

    const conversations: { [lookup: string]: Conversation } = {};

    for await (const convo of convos) {
      const { key, value } = convo;

      conversations[key[key.length - 1].toString()] = value as Conversation;
    }

    return conversations;
  }

  public async History(convoLookup: string): Promise<ConversationMessage[]> {
    const convoMsgs = await this.kv.list({
      prefix: [...this.convosRoot, convoLookup, ...this.messageRoot],
    });

    const messages: ConversationMessage[] = [];

    for await (const message of convoMsgs) {
      const { value } = message;

      messages.push(value as ConversationMessage);
    }

    // return messages;
    return messages.sort((a, b) => {
      if (a.Timestamp! < b.Timestamp!) {
        return -1;
      } else if (a.Timestamp! > b.Timestamp!) {
        return 1;
      } else {
        return 0;
      }
    });
  }

  public async Reset(convoLookup: string): Promise<void> {
    const convoMsgs = await this.kv.list({
      prefix: [...this.convosRoot, convoLookup, ...this.messageRoot],
    });

    for await (const message of convoMsgs) {
      const { key } = message;

      await this.kv.delete(key);
    }
  }
}
