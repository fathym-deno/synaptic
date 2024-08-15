import { SynapticNeuronResolver } from "../SynapticNeuronResolver.ts";
import { SynapticResolverConfiguration } from "../SynapticResolverConfiguration.ts";
import { EaCToolExecutorNeuron } from "../../eac/neurons/EaCToolExecutorNeuron.ts";
import { resolveTools } from "../../plugins/FathymSynapticPlugin.ts";
import {
  BaseMessage,
  FunctionMessage,
  jsonpath,
  Runnable,
  RunnableLambda,
  ToolExecutor,
  ToolInvocationInterface,
  ToolMessage,
} from "../../src.deps.ts";

export const SynapticResolverConfig: SynapticResolverConfiguration = {
  Type: "neuron",
  Name: "ToolExecutor",
};

export default {
  async Resolve(_neuronLookup, neuron, ioc) {
    const tools = await resolveTools(neuron.ToolLookups, ioc);

    let runnable = new ToolExecutor({ tools }) as unknown as Runnable;

    const msgsPath = neuron.MessagesPath;

    if (msgsPath) {
      const origRunnable = runnable;

      runnable = RunnableLambda.from(async (state) => {
        const messages = jsonpath.query(state, msgsPath)[0] as BaseMessage[];

        const lastMessage = messages[messages.length - 1];

        if (!lastMessage) {
          throw new Error("No messages found.");
        }

        if (
          !lastMessage.additional_kwargs.function_call &&
          !lastMessage.additional_kwargs.tool_calls
        ) {
          throw new Error("No function call found in message.");
        }

        const actions: (ToolInvocationInterface & {
          callId?: string;
        })[] = [];

        if (lastMessage.additional_kwargs.function_call) {
          actions.push({
            tool: lastMessage.additional_kwargs.function_call.name,
            toolInput: JSON.parse(
              lastMessage.additional_kwargs.function_call.arguments,
            ),
          });
        } else if (lastMessage.additional_kwargs.tool_calls) {
          actions.push(
            ...lastMessage.additional_kwargs.tool_calls.map((toolCall) => {
              return {
                callId: toolCall.id,
                tool: toolCall.function.name,
                toolInput: JSON.parse(toolCall.function.arguments),
              };
            }),
          );
        }

        const msgs = await Promise.all(
          actions.map(async (action) => {
            const response = await origRunnable.invoke(action);

            if (lastMessage.additional_kwargs.tool_calls) {
              return new ToolMessage({
                tool_call_id: action.callId!,
                content: response,
                name: action.tool,
              });
            } else {
              return new FunctionMessage({
                content: response,
                name: action.tool,
              });
            }
          }),
        );

        return msgs;
      });
    }

    return runnable;
  },
} as SynapticNeuronResolver<EaCToolExecutorNeuron>;
