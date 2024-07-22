import {
  AIMessage,
  AIMessageChunk,
  BaseMessage,
  HumanMessage,
  HumanMessageChunk,
} from "../src.deps.ts";

export function lastHumanMessages(messages?: BaseMessage[]) {
  return lastMessagesOfType(messages ?? [], [
    HumanMessage.name,
    HumanMessageChunk.name,
  ]);
}

export function lastAiNotHumanMessages(messages?: BaseMessage[]) {
  return lastMessagesOfType(
    messages ?? [],
    [AIMessage.name, AIMessageChunk.name],
    [HumanMessage.name, HumanMessageChunk.name],
  );
}

export function lastMessagesOfType(
  messages: BaseMessage[],
  types: string[],
  endTypes?: string[],
) {
  let hitEnd = false;

  const lastMsgs = messages?.reverse().reduce((acc, msg) => {
    if (!hitEnd) {
      if (types.includes(msg.constructor.name)) {
        acc.unshift(msg);
      }

      if (
        endTypes
          ? endTypes.includes(msg.constructor.name)
          : !types.includes(msg.constructor.name)
      ) {
        hitEnd = true;
      }
    }

    return acc;
  }, [] as BaseMessage[]);

  return lastMsgs;
}
