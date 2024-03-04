import { AzureExtensionsOptions } from "npm:@azure/openai@1.0.0-beta.7";
import { IConversationState } from "../../conversations/IConversationState.ts";
import { ChatResponse } from "../ILLMAccessor.ts";

export function loadAzureExtensionOptions(
  indexName: string,
): AzureExtensionsOptions {
  const azureSearchEndpoint = Deno.env.get("AZURE_SEARCH_ENDPOINT");
  const azureSearchAdminKey = Deno.env.get("AZURE_SEARCH_ADMIN_KEY");

  const azureEmbeddingEndpoint = Deno.env.get("AZURE_EMBEDDING_ENDPOINT");
  const azureEmbeddingKey = Deno.env.get("AZURE_EMBEDDING_KEY");

  const extensionData = loadExtensionData(indexName);

  return {
    extensions: [
      {
        type: "AzureCognitiveSearch",
        parameters: {
          endpoint: azureSearchEndpoint,
          key: azureSearchAdminKey,
          inScope: false,
          embeddingEndpoint: azureEmbeddingEndpoint,
          embeddingKey: azureEmbeddingKey,
          filter: null,
          queryType: "vectorSimpleHybrid",
          semanticConfiguration: null,
          ...extensionData,
        },
      },
    ],
  };
}

export function loadExtensionData(indexName: string) {
  if (indexName.startsWith("harbor")) {
    return {
      indexName: indexName,
      fieldsMapping: {
        contentFieldsSeparator: "↵",
        contentFields: ["content"],
        filepathField: "filepath",
        titleField: "title",
        urlField: "url",
        vectorFields: ["titleVector", "contentVector"],
      },
      roleInformation:
        "You are an AI assistant that helps people find information.",
    };
  }

  return {};
}

export function loadReadableChatStream(
  convoState: IConversationState,
  convoLookup: string,
  chatResponse: AsyncIterable<ChatResponse>,
) {
  const stream = new ReadableStream({
    async start(controller) {
      let completeText = "";

      // controller.enqueue(`event: message\n\n`);

      for await (const event of chatResponse) {
        if (event) {
          controller.enqueue(`data: ${event}\n\n`);

          completeText += event;
        }
      }

      controller.enqueue(`data: [DONE]\n\n`);

      controller.close();

      await convoState.Add(convoLookup, {
        From: "assistant",
        Content: completeText,
      });
    },
    cancel() {
      // bc.close();
    },
  });

  return stream.pipeThrough(new TextEncoderStream());
}
