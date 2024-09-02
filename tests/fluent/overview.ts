import { EverythingAsCodeSynaptic } from '../../src/eac/.exports.ts';
import { EaCAzureOpenAIEmbeddingsDetails } from '../../src/eac/EaCAzureOpenAIEmbeddingsDetails.ts';
import { eacFluentBuilder } from '../../src/fluent/.exports.ts';
import {
  assert,
  assertEquals,
  assertFalse,
  assertNotEquals,
  jsonMapSetClone,
} from '../tests.deps.ts';

Deno.test('Overview Bench', async (t) => {
  await t.step('AI as Code Builder', async () => {
    const aiLookup = 'SynapticAIAsCodeBuilderTest';

    const aiName = 'The test AIs config';

    const eacName = 'AI as Code Builder Test';

    const eacBldr = eacFluentBuilder<EverythingAsCodeSynaptic>({
      Details: {
        Name: eacName,
      },
    });

    const aiBldr = eacBldr.AIs(aiLookup).With((bldr) => {
      bldr
        .Details()
        .Name(aiName)
        .Description('Used for testing the AIs configuration.');

      bldr
        .Embeddings('TestEmbedding')
        .Details<EaCAzureOpenAIEmbeddingsDetails>()
        .Type('AzureOpenAI')
        .Name('SynapticAIAsCodeBuilderTest')
        .Description('A test AI');

      // bldr
      //   .Embeddings("")
      //   .Details()
      //   .Type("")
      //   .Name("SynapticAIAsCodeBuilderTest")
      //   .Description("A test AI");

      // bldr
      //   .LLMs("")
      //   .AzureOpenAIDetails()
      //   .Name("SynapticAIAsCodeBuilderTest")
      //   .Description("SynapticAIAsCodeBuilderTest");
    });

    // eacBldr.Circuits();

    const eac = (await eacBldr.Export()) as EverythingAsCodeSynaptic;

    assert(eac);
    assert(eac.Details);
    assertEquals(eac.Details?.Name, eacName);
    assert(eac.AIs);
    assert(eac.AIs![aiLookup]);
    assert(eac.AIs![aiLookup].Details);
    assertEquals(eac.AIs![aiLookup].Details!.Name, aiName);

    const ai = (await aiBldr.Export()) as EverythingAsCodeSynaptic;

    assert(ai);
    assertFalse(ai.Details);
    assert(ai.AIs);
    assert(ai.AIs![aiLookup]);
    assert(ai.AIs![aiLookup].Details);
    assertEquals(ai.AIs![aiLookup].Details!.Name, aiName);

    const aiDetails = await eacBldr.AIs(aiLookup).Details().Export();

    assert(aiDetails);
    assertFalse(aiDetails.Details);
    assert(aiDetails.AIs);
    assert(aiDetails.AIs![aiLookup]);
    assert(aiDetails.AIs![aiLookup].Details);
    assertEquals(aiDetails.AIs![aiLookup].Details!.Name, aiName);

    const ioc = await eacBldr.Compile();

    console.log(ioc);
  });
});
