<<<<<<< HEAD
import { EverythingAsCodeSynaptic } from "../../src/eac/.exports.ts";
import { EaCAzureOpenAIEmbeddingsDetails } from "../../src/eac/EaCAzureOpenAIEmbeddingsDetails.ts";
import { synapticFluentBuilder } from "../../src/fluent/.exports.ts";
import { assert, assertEquals, assertFalse } from "../tests.deps.ts";
=======
// import { EverythingAsCodeSynaptic } from "../../src/eac/.exports.ts";
// import { EaCAzureOpenAIEmbeddingsDetails } from "../../src/eac/EaCAzureOpenAIEmbeddingsDetails.ts";
// import { eacFluentBuilder } from "../../src/fluent/.exports.ts";
// import { assert, assertEquals, assertFalse } from "../tests.deps.ts";
>>>>>>> 8ed65ae4f33581526c61be8ac05214894d386fa4

// Deno.test("Overview Bench", async (t) => {
//   await t.step("AI as Code Builder", async () => {
//     const aiLookup = "SynapticAIAsCodeBuilderTest";

//     const aiName = "The test AIs config";
//     const aiDesc = "Used for testing the AIs configuration.";

//     const eacName = "AI as Code Builder Test";

<<<<<<< HEAD
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
=======
//     const eacBldr = eacFluentBuilder<EverythingAsCodeSynaptic>({
//       Details: {
//         Name: eacName,
//       },
//     });

//     const aiBldr = eacBldr.AIs(aiLookup).With((bldr) => {
//       bldr.Details().Name(aiName).Description(aiDesc);

//       bldr
//         .Embeddings("TestEmbedding")
//         .Details<EaCAzureOpenAIEmbeddingsDetails>()
//         .Type("AzureOpenAI")
//         .Name("SynapticAIAsCodeBuilderTest")
//         .Description("A test AI")
//         .APIKey(Deno.env.get("AZURE_OPENAI_KEY")!)
//         .Instance(Deno.env.get("AZURE_OPENAI_INSTANCE")!)
//         .DeploymentName("text-embedding-ada-002");
>>>>>>> 8ed65ae4f33581526c61be8ac05214894d386fa4

//       // bldr
//       //   .LLMs("")
//       //   .AzureOpenAIDetails()
//       //   .Name("SynapticAIAsCodeBuilderTest")
//       //   .Description("SynapticAIAsCodeBuilderTest");
//     });

//     // eacBldr.Circuits();

//     const eac = await eacBldr.Export();

//     assert(eac);
//     assert(eac.Details);
//     assertEquals(eac.Details?.Name, eacName);
//     assert(eac.AIs);
//     assert(eac.AIs![aiLookup]);
//     assert(eac.AIs![aiLookup].Details);
//     assertEquals(eac.AIs![aiLookup].Details!.Name, aiName);
//     assertEquals(eac.AIs![aiLookup].Details!.Description, aiDesc);

//     const ai = await aiBldr.Export();

//     assert(ai);
//     assertFalse(ai.Details);
//     assert(ai.AIs);
//     assert(ai.AIs![aiLookup]);
//     assert(ai.AIs![aiLookup].Details);
//     assertEquals(ai.AIs![aiLookup].Details!.Name, aiName);
//     assertEquals(ai.AIs![aiLookup].Details!.Description, aiDesc);

<<<<<<< HEAD
    const aiDetails = await eacBldr.AIs(aiLookup, true).Details().Export();
=======
//     const aiDetails = await eacBldr.AIs(aiLookup).Details().Export();
>>>>>>> 8ed65ae4f33581526c61be8ac05214894d386fa4

//     assert(aiDetails);
//     assertFalse(aiDetails.Details);
//     assert(aiDetails.AIs);
//     assert(aiDetails.AIs![aiLookup]);
//     assert(aiDetails.AIs![aiLookup].Details);
//     assertEquals(aiDetails.AIs![aiLookup].Details!.Name, aiName);
//     assertEquals(aiDetails.AIs![aiLookup].Details!.Description, aiDesc);

<<<<<<< HEAD
    const aiAgain = await eacBldr
      .AIs(aiLookup, true)
      .Details()
      .Name(aiName)
      .Description(aiDesc)
      .Export();
=======
//     const aiAgain = await eacBldr
//       .AIs(aiLookup)
//       .Details()
//       .Name(aiName)
//       .Description(aiDesc)
//       .Export();
>>>>>>> 8ed65ae4f33581526c61be8ac05214894d386fa4

//     assert(aiAgain);
//     assertFalse(aiAgain.Details);
//     assert(aiAgain.AIs);
//     assert(aiAgain.AIs![aiLookup]);
//     assert(aiAgain.AIs![aiLookup].Details);
//     assertEquals(aiDetails.AIs![aiLookup].Details!.Name, aiName);
//     assertEquals(aiDetails.AIs![aiLookup].Details!.Description, aiDesc);

<<<<<<< HEAD
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
=======
//     const ioc = await eacBldr.Compile();

//     console.log(ioc);
//   });

//   await t.step("Circuit as Code Builder", async () => {
//     const eacBldr = eacFluentBuilder<EverythingAsCodeSynaptic>({
//       Details: {
//         Name: "AI as Code Builder Test",
//       },
//     });

//     // eacBldr.Circuits();

//     const ioc = await eacBldr.Compile();

//     console.log(ioc);
//   });
// });
>>>>>>> 8ed65ae4f33581526c61be8ac05214894d386fa4
