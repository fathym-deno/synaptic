import { ConfigPersonalityProvider } from '../../src/personalities/providers/ConfigPersonalityProvider.ts';
import { assertEquals, assertExists } from '../tests.deps.ts';
import personalities, { HarborPersonality } from '../personalities.config.ts';

Deno.test('ConfigPersonalityProvider tests', async (t) => {
  const perPrvdr = new ConfigPersonalityProvider(personalities);

  await t.step('Harbor Personality Retrieval test', async () => {
    const personality = await perPrvdr.Provide(HarborPersonality);

    assertExists(personality.Declarations);

    assertEquals(
      personality.Declarations![0],
      'You are a helpful industrial information assistant.'
    );
  });
});
