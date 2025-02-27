import {
  AIMessage,
  AIMessageChunk,
  BaseMessage,
  HumanMessage,
  HumanMessageChunk,
} from "../src.deps.ts";

export function lastHumanMessages(messages?: BaseMessage[]): BaseMessage[] {
  return lastMessagesOfType(messages ?? [], [
    HumanMessage.name,
    HumanMessageChunk.name,
  ]);
}

export function lastAiNotHumanMessages(
  messages?: BaseMessage[],
): BaseMessage[] {
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
): BaseMessage[] {
  let hitEnd = false;

  const lastMsgs = [...messages]?.reverse().reduce((acc, msg) => {
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

export function extractToolArgs<T>(msg: AIMessage): T | null {
  if (msg) {
    // if (msg.tool_calls?.length) {
    //   const tool = msg.tool_calls[0].args;
    //   return JSON.parse(tool.arguments) as T;
    // } else
    if (msg.additional_kwargs.tool_calls?.length) {
      const tool = msg.additional_kwargs.tool_calls[0].function;
      return JSON.parse(tool.arguments) as T;
    } else if (msg.additional_kwargs.function_call) {
      const tool = msg.additional_kwargs.function_call;
      return JSON.parse(tool.arguments) as T;
    }
  }
  return null;
}
