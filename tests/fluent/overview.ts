import { EverythingAsCodeSynaptic } from "../../src/eac/.exports.ts";
import { EaCAzureOpenAIEmbeddingsDetails } from "../../src/eac/EaCAzureOpenAIEmbeddingsDetails.ts";
import { synapticFluentBuilder } from "../../src/fluent/.exports.ts";
import { assert, assertEquals, assertFalse } from "../tests.deps.ts";

Deno.test("Overview Bench", async (t) => {
  await t.step("AI as Code Builder", async () => {
    const aiLookup = "SynapticAIAsCodeBuilderTest";

    const aiName = "The test AIs config";
    const aiDesc = "Used for testing the AIs configuration.";

    const eacName = "AI as Code Builder Test";

    const eacBldr = synapticFluentBuilder<EverythingAsCodeSynaptic>({
      Details: {
        Name: eacName,
      },
    }).Root();

    const aiBldr = eacBldr.AIs(aiLookup, true).With((bldr) => {
      bldr.Details().Name(aiName).Description(aiDesc);

      bldr
        .Embeddings("TestEmbedding", true)
        .Details<EaCAzureOpenAIEmbeddingsDetails>()
        .Type("AzureOpenAI")
        .Name("SynapticAIAsCodeBuilderTest")
        .Description("A test AI")
        .APIKey(Deno.env.get("AZURE_OPENAI_KEY")!)
        .Instance(Deno.env.get("AZURE_OPENAI_INSTANCE")!)
        .DeploymentName("text-embedding-ada-002");

      // bldr
      //   .LLMs("")
      //   .AzureOpenAIDetails()
      //   .Name("SynapticAIAsCodeBuilderTest")
      //   .Description("SynapticAIAsCodeBuilderTest");
    });

    // eacBldr.Circuits();

    const eac = await eacBldr.Export();

    assert(eac);
    assert(eac.Details);
    assertEquals(eac.Details?.Name, eacName);
    assert(eac.AIs);
    assert(eac.AIs![aiLookup]);
    assert(eac.AIs![aiLookup].Details);
    assertEquals(eac.AIs![aiLookup].Details!.Name, aiName);
    assertEquals(eac.AIs![aiLookup].Details!.Description, aiDesc);

    const ai = await aiBldr.Export();

    assert(ai);
    assertFalse(ai.Details);
    assert(ai.AIs);
    assert(ai.AIs![aiLookup]);
    assert(ai.AIs![aiLookup].Details);
    assertEquals(ai.AIs![aiLookup].Details!.Name, aiName);
    assertEquals(ai.AIs![aiLookup].Details!.Description, aiDesc);

    const aiDetails = await eacBldr.AIs(aiLookup, true).Details().Export();

    assert(aiDetails);
    assertFalse(aiDetails.Details);
    assert(aiDetails.AIs);
    assert(aiDetails.AIs![aiLookup]);
    assert(aiDetails.AIs![aiLookup].Details);
    assertEquals(aiDetails.AIs![aiLookup].Details!.Name, aiName);
    assertEquals(aiDetails.AIs![aiLookup].Details!.Description, aiDesc);

    const aiAgain = await eacBldr
      .AIs(aiLookup, true)
      .Details()
      .Name(aiName)
      .Description(aiDesc)
      .Export();

    assert(aiAgain);
    assertFalse(aiAgain.Details);
    assert(aiAgain.AIs);
    assert(aiAgain.AIs![aiLookup]);
    assert(aiAgain.AIs![aiLookup].Details);
    assertEquals(aiDetails.AIs![aiLookup].Details!.Name, aiName);
    assertEquals(aiDetails.AIs![aiLookup].Details!.Description, aiDesc);

    // const ioc = await eacBldr.Compile();

    // console.log(ioc);
  });

  await t.step("Circuit as Code Builder", () => {
    const eacBldr = synapticFluentBuilder<EverythingAsCodeSynaptic>({
      Details: {
        Name: "AI as Code Builder Test",
      },
    }).Root();

    eacBldr.Circuits("Test", true);

    // const ioc = await eacBldr.Compile();

    // console.log(ioc);
  });
});
