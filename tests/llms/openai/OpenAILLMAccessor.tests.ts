import { OpenAILLMAccessor } from '../../../src/llms/openai/OpenAILLMAccessor.ts';
import { Personality } from '../../../src/personalities/Personality.ts';
import { AzureKeyCredential, OpenAIClient } from '../../../src/src.deps.ts';
import { assertFalse } from '../../tests.deps.ts';

Deno.test('OpenAILLMAccessor tests', async (t) => {
  const endpoint = 'https://thinky-ai-prd.openai.azure.com'; //Deno.env.get('OPENAI_ENDPOINT') || '';
  const azureApiKey = '10d6457a8ee34b1db592be343c5209d3'; // Deno.env.get('OPENAI_API_KEY') || '';

  const client = new OpenAIClient(
    endpoint,
    new AzureKeyCredential(azureApiKey)
  );

  const llm = new OpenAILLMAccessor(client);

  const personality: Personality = {
    Declarations: ['You are a super helpful AI assistant.'],
  };

  await t.step('ChatStream tests', async () => {
    const chatParts = await llm.ChatStream(personality, [
      {
        From: 'assistant',
        Content:
          'Please provide me a story that starts `Once upon a time` and is only 1 paragraph.',
      },
    ]);

    let i = 0;

    let full = '';
    for await (const chatPart of chatParts) {
      i++;

      if (chatPart) {
        full += chatPart;
      }
    }

    assertFalse(i == 1);
    assertFalse(!full.startsWith('Once upon a time'));
  });

  await t.step('Chat tests', async () => {
    const fullChat = await llm.Chat(personality, [
      {
        From: 'assistant',
        Content:
          'Please provide me a story that starts `Once upon a time` and is only 1 paragraph.',
      },
    ]);

    assertFalse(!fullChat!.startsWith('Once upon a time'));
  });
});
