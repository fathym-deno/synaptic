import { ConversationMessage } from "../../conversations/ConversationMessage.ts";
import { IConversationState } from "../../conversations/IConversationState.ts";
import { FunctionToCall } from "../../llms/ILLMAccessor.ts";
import { OpenAILLMAccessor } from "../../llms/openai/OpenAILLMAccessor.ts";
import {
  PageBlock,
  PageBlockManager,
} from "../../pages/blocks/PageBlockManager.ts";
import { IPersonalityProvider } from "../../personalities/IPersonalityProvider.ts";
import { PersonalityKey } from "../../personalities/PersonalityKey.ts";
import { Handlers, JSX } from "../../src.deps.ts";
import { SynapticConfig } from "../SynapticConfig.ts";

export function loadAllPageBlocksApis(config: SynapticConfig) {
  const pageBlocks = pageBlocksRoute(
    config.PageBlockManager,
    config.APIRoot,
    config.Pages.Root,
    config.Pages.Blocks.Root,
  );

  const functions = pageBlockFunctionsRoute(
    config.PageBlockManager,
    config.APIRoot,
    config.Pages.Root,
    config.Pages.Blocks.Root,
  );

  const pageBlockLookup = pageBlockLookupRoute(
    config.PageBlockManager,
    config.APIRoot,
    config.Pages.Root,
    config.Pages.Blocks.Root,
  );

  const pageBlockRegenerateConvoLookup = pageBlockRegenerateConvoLookupRoute(
    config.PageBlockManager,
    config.ConvoState,
    config.Personalities,
    config.Pages.Blocks.RegeneratePersonalityKey,
    config.LLM,
    config.APIRoot,
    config.Pages.Root,
    config.Pages.Blocks.Root,
  );

  return {
    Handlers: {
      PageBlocks: pageBlocks.handler,
      PageBlockFunctions: functions.handler,
      PageBlockLookup: pageBlockLookup.handler,
      RegenerateConvoLookup: pageBlockRegenerateConvoLookup.handler,
    },
    Routes: [
      pageBlocks,
      functions,
      pageBlockLookup,
      pageBlockRegenerateConvoLookup,
    ],
  };
}

export function pageBlocksRoute(
  pageBlocks: PageBlockManager,
  apiRoot?: string,
  pagesRoot?: string,
  pageBlocksRoot?: string,
) {
  const handler: Handlers<JSX.Element, Record<string, unknown>> = {
    async GET(_req, _ctx) {
      const body = JSON.stringify(await pageBlocks.List());

      return new Response(body, {
        headers: {
          "content-type": "application/json",
          "cache-control": "no-cache",
        },
      });
    },
    async POST(req, _ctx) {
      const block: PageBlock = await req.json();

      await pageBlocks.Save(block);

      return new Response(JSON.stringify({ Status: "Success" }), {
        headers: {
          "content-type": "application/json",
          "cache-control": "no-cache",
        },
      });
    },
  };

  return {
    path: `/${apiRoot || "api"}/${pagesRoot || "pages"}/${
      pageBlocksRoot || "blocks"
    }`,
    handler,
    component: undefined,
  };
}

export function pageBlockFunctionsRoute(
  pageBlocks: PageBlockManager,
  apiRoot?: string,
  pagesRoot?: string,
  pageBlocksRoot?: string,
) {
  const handler: Handlers<JSX.Element, Record<string, unknown>> = {
    async GET(_req, _ctx) {
      const body = JSON.stringify(await pageBlocks.Functions());

      return new Response(body, {
        headers: {
          "content-type": "application/json",
          "cache-control": "no-cache",
        },
      });
    },
  };

  return {
    path: `/${apiRoot || "api"}/${pagesRoot || "pages"}/${
      pageBlocksRoot || "blocks"
    }/functions`,
    handler,
    component: undefined,
  };
}

export function pageBlockLookupRoute(
  pageBlocks: PageBlockManager,
  apiRoot?: string,
  pagesRoot?: string,
  pageBlocksRoot?: string,
) {
  const handler: Handlers<JSX.Element, Record<string, unknown>> = {
    async GET(_req, ctx) {
      const block = await pageBlocks.Get(ctx.params.blockLookup);

      const body = JSON.stringify(block);

      return new Response(body, {
        headers: {
          "content-type": "text/event-stream",
          "cache-control": "no-cache",
        },
      });
    },
    async DELETE(_req, ctx) {
      const blockLookup = ctx.params.blockLookup;

      await pageBlocks.Delete(blockLookup);

      return new Response(null, {
        headers: {
          "content-type": "text/html",
        },
      });
    },
  };

  return {
    path: `/${apiRoot || "api"}/${pagesRoot || "pages"}/${
      pageBlocksRoot || "blocks"
    }/[blockLookup]`,
    handler,
    component: undefined,
  };
}

export function pageBlockRegenerateConvoLookupRoute(
  pageBlocks: PageBlockManager,
  convoState: IConversationState,
  personalities: IPersonalityProvider,
  personalityKey: PersonalityKey,
  llm: OpenAILLMAccessor,
  apiRoot?: string,
  pagesRoot?: string,
  pageBlocksRoot?: string,
) {
  const handler: Handlers<JSX.Element, Record<string, unknown>> = {
    async POST(req, ctx) {
      const convoLookup = ctx.params.convoLookup;

      const personality = await personalities.Provide(personalityKey);

      const messages = (await convoState.History(convoLookup)) || [];

      const apiReq: { command: string; portrayal: PageBlock } = await req
        .json();

      const commandMsg: ConversationMessage | undefined = apiReq.command
        ? {
          Content: apiReq.command,
          From: "user",
        }
        : undefined;

      if (commandMsg) {
        messages.push(commandMsg);
      }

      const functions = await pageBlocks.Functions();

      const currentOptionIndex = functions.findIndex(
        (o) => o.Definition.name === apiReq.portrayal.Type,
      );

      // const azureSearchIndexName = Deno.env.get("AZURE_SEARCH_INDEX_NAME");

      const chatResp = (await llm.Chat(personality, messages, {
        Model: "gpt-4-32k",
        // Extensions: loadAzureExtensionOptions(azureSearchIndexName!),
        FunctionRequired: 0,
        Functions: [functions[currentOptionIndex].Definition],
      })) as FunctionToCall;

      const body = JSON.stringify({
        ...apiReq.portrayal,
        Details: chatResp.arguments,
        Type: chatResp.name,
      } as PageBlock);

      return new Response(body, {
        headers: {
          "content-type": "text/event-stream",
          "cache-control": "no-cache",
        },
      });
    },
  };

  return {
    path: `/${apiRoot || "api"}/${pagesRoot || "pages"}/${
      pageBlocksRoot || "blocks"
    }/regenerate/[convoLookup]`,
    handler,
    component: undefined,
  };
}
