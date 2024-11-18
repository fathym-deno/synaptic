import {
  BaseListChatMessageHistory,
  BaseMessage,
  delay,
  mapChatMessagesToStoredMessages,
  mapStoredMessagesToChatMessages,
  StoredMessage,
} from "../src.deps.ts";

// Not required, but usually chat message histories will handle multiple sessions
// for different users, and should take some kind of sessionId as input.
export interface DenoKVChatMessageHistoryConfig {
  KV: Deno.Kv;

  RootKey: Deno.KvKey;
}

export class DenoKVChatMessageHistory extends BaseListChatMessageHistory {
  lc_namespace = ["langchain", "stores", "denokv", "message"];

  constructor(
    protected sessionId: string,
    protected config: DenoKVChatMessageHistoryConfig,
  ) {
    super(config);
  }

  public async getMessages(): Promise<BaseMessage[]> {
    const messages = this.config.KV.list<StoredMessage>({
      prefix: this.buildKey([this.sessionId]),
    });

    const outMsgs: StoredMessage[] = [];

    for await (const message of messages) {
      outMsgs.push(message.value);
    }

    return mapStoredMessagesToChatMessages(outMsgs);
  }

  public async addMessage(message: BaseMessage): Promise<void> {
    await this.addMessages([message]);
  }

  public override async addMessages(messages: BaseMessage[]): Promise<void> {
    const serializedMessages = mapChatMessagesToStoredMessages(messages);

    let op = this.config.KV.atomic();

    for (const message of serializedMessages) {
      op = op.set(this.buildKey([this.sessionId, Date.now()]), message);

      await delay(1);
    }

    await op.commit();
  }

  public override async clear(): Promise<void> {
    const messages = this.config.KV.list<StoredMessage>({
      prefix: this.buildKey([this.sessionId]),
    });

    let op = this.config.KV.atomic();

    for await (const message of messages) {
      op = op.delete(message.key);
    }

    await op.commit();
  }

  protected buildKey(key: Deno.KvKey): Deno.KvKey {
    return [...this.config.RootKey, ...this.lc_namespace, ...key];
  }
}
