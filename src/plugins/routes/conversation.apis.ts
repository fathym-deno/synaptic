import { Conversation } from "../../conversations/Conversation.ts";
import { ConversationMessage } from "../../conversations/ConversationMessage.ts";
import { IConversationState } from "../../conversations/IConversationState.ts";
import { OpenAILLMAccessor } from "../../llms/openai/OpenAILLMAccessor.ts";
import {
  loadAzureExtensionOptions,
  loadReadableChatStream,
} from "../../llms/openai/utils.ts";
import { IPersonalityProvider } from "../../personalities/IPersonalityProvider.ts";
import { PersonalityKey } from "../../personalities/PersonalityKey.ts";
import { Handlers, JSX } from "../../src.deps.ts";
import { SynapticConfig } from "../SynapticConfig.ts";

export function loadAllConversationApis(config: SynapticConfig) {
  const getAllConvos = getAllConversationsRoute(
    config.ConvoState,
    config.APIRoot,
    config.Conversations?.Root,
  );

  const convoLookup = convoLookupRoute(
    config.ConvoState,
    config.APIRoot,
    config.Conversations?.Root,
  );

  const chatConvoLookup = chatConvoLookupRoute(
    config.ConvoState,
    config.Personalities,
    config.Conversations.ChatPersonalityKey,
    config.LLM,
    config.APIRoot,
    config.Conversations?.Root,
  );

  return {
    Handlers: {
      GetAllConversations: getAllConvos.handler,
      ConvoLookup: convoLookup.handler,
      ChatConvoLookup: chatConvoLookup.handler,
    },
    Routes: [getAllConvos, convoLookup, chatConvoLookup],
  };
}

export function getAllConversationsRoute(
  convoState: IConversationState,
  apiRoot?: string,
  conversationsRoot?: string,
) {
  const handler: Handlers<JSX.Element, Record<string, unknown>> = {
    async GET(_req, _ctx) {
      const convos = (await convoState.GetAll()) || {};

      const body = JSON.stringify(convos);

      return new Response(body, {
        headers: {
          "content-type": "application/json",
          "cache-control": "no-cache",
        },
      });
    },
  };

  return {
    path: `/${apiRoot || "api"}/${conversationsRoot || "conversations"}`,
    handler,
    component: undefined,
  };
}

export function convoLookupRoute(
  convoState: IConversationState,
  apiRoot?: string,
  conversationsRoot?: string,
) {
  const handler: Handlers<JSX.Element, Record<string, unknown>> = {
    async GET(_req, ctx) {
      const convoLookup = ctx.params.convoLookup;

      const convo = await convoState.Get(convoLookup);

      const body = JSON.stringify(convo);

      return new Response(body, {
        headers: {
          "content-type": "application/json",
          "cache-control": "no-cache",
        },
      });
    },
    async POST(req, ctx) {
      const convoLookup = ctx.params.convoLookup;

      const convo: Conversation = await req.json();

      await convoState.Create(convoLookup, convo);

      return new Response(JSON.stringify({ Status: "Success" }), {
        headers: {
          "content-type": "application/json",
          "cache-control": "no-cache",
        },
      });
    },
    async DELETE(_req, ctx) {
      const convoLookup = ctx.params.convoLookup;

      await convoState.Delete(convoLookup);

      return new Response(JSON.stringify({ Status: "Success" }), {
        headers: {
          "content-type": "application/json",
        },
      });
    },
  };

  return {
    path: `/${apiRoot || "api"}/${
      conversationsRoot || "conversations"
    }/[convoLookup]`,
    handler,
    component: undefined,
  };
}

export function chatConvoLookupRoute(
  convoState: IConversationState,
  personalities: IPersonalityProvider,
  personalityKey: PersonalityKey,
  llm: OpenAILLMAccessor,
  apiRoot?: string,
  conversationsRoot?: string,
) {
  const handler: Handlers<JSX.Element, Record<string, unknown>> = {
    async GET(_req, ctx) {
      const convoLookup = ctx.params.convoLookup;

      const messages = (await convoState.History(convoLookup)) || [];

      const body = JSON.stringify(messages);

      return new Response(body, {
        headers: {
          "content-type": "application/json",
          "cache-control": "no-cache",
        },
      });
    },
    async POST(req, ctx) {
      const convoLookup = ctx.params.convoLookup;

      const personality = await personalities.Provide(personalityKey);

      const url = new URL(req.url);

      const convoMsg: ConversationMessage = {
        Content: await req.text(),
        From: "user",
      };

      await convoState.Add(convoLookup, convoMsg);

      const messages = (await convoState.History(convoLookup)) || [];

      const azureSearchIndexName = Deno.env.get("AZURE_SEARCH_INDEX_NAME");

      const useOpenChat = url.searchParams.get("useOpenChat") === "true";

      const chatCompletions = await llm.ChatStream(personality, messages, {
        Model: "gpt-4-32k",
        // Model: "gpt-35-turbo-16k",
        Extensions: useOpenChat
          ? undefined
          : loadAzureExtensionOptions(azureSearchIndexName!),
        Stream: true,
      });

      const body = loadReadableChatStream(
        convoState,
        convoLookup,
        chatCompletions,
      );

      return new Response(body, {
        headers: {
          "content-type": "text/event-stream",
          "cache-control": "no-cache",
        },
      });
    },
    async DELETE(_req, ctx) {
      const convoLookup = ctx.params.convoLookup;

      await convoState.Reset(convoLookup);

      return new Response(null, {
        headers: {
          "content-type": "text/html",
        },
      });
    },
  };

  return {
    path: `/${apiRoot || "api"}/${
      conversationsRoot || "conversations"
    }/chat/[convoLookup]`,
    handler,
    component: undefined,
  };
}
