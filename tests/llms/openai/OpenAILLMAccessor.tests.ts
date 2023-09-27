// import { OpenAILLMAccessor } from "../../../src/llms/openai/OpenAILLMAccessor.ts";
// import { Personality } from "../../../src/personalities/Personality.ts";
// import {
//   AzureKeyCredential,
//   FunctionDefinition,
//   OpenAIClient,
// } from "../../../src/src.deps.ts";
// import { assertExists, assertFalse } from "../../tests.deps.ts";
// import { FunctionToCall } from "../../../src/llms/ILLMAccessor.ts";

// Deno.test("OpenAILLMAccessor tests", async (t) => {
//   const endpoint = Deno.env.get("OPENAI_ENDPOINT") || "";

//   const azureApiKey = Deno.env.get("OPENAI_API_KEY") || "";

//   const client = new OpenAIClient(
//     endpoint,
//     new AzureKeyCredential(azureApiKey),
//   );

//   const llm = new OpenAILLMAccessor(client);

//   const personality: Personality = {
//     Declarations: ["You are a super helpful AI assistant."],
//   };

//   await t.step("ChatStream tests", async () => {
//     const chatParts = await llm.ChatStream(personality, [
//       {
//         From: "assistant",
//         Content:
//           "Please provide me a story that starts `Once upon a time` and is only 1 paragraph.",
//       },
//     ]);

//     let i = 0;

//     let full = "";
//     for await (const chatPart of chatParts) {
//       i++;

//       if (chatPart) {
//         full += chatPart as string;
//       }
//     }

//     assertFalse(i == 1);
//     assertFalse(!full.startsWith("Once upon a time"));
//   });

//   await t.step("Chat tests", async () => {
//     const fullChat = (await llm.Chat(personality, [
//       {
//         From: "assistant",
//         Content:
//           "Please provide me a story that starts `Once upon a time` and is only 1 paragraph.",
//       },
//     ])) as string;

//     assertFalse(!fullChat!.startsWith("Once upon a time"));
//   });

//   await t.step("Function Call Chat tests", async () => {
//     const funcToCall = (await llm.Chat(
//       personality,
//       [
//         {
//           From: "user",
//           Content: "Please provide with a report about the state of IIoT.",
//         },
//       ],
//       {
//         Model: "gpt-35-turbo-16k",
//         Functions: [loadTestFunction()],
//       },
//     )) as FunctionToCall;

//     assertExists(funcToCall);
//     assertExists(funcToCall.arguments.reportTitle);
//     assertExists(funcToCall.arguments.reportSubhead);
//   });
// });

// export function loadTestFunction(): FunctionDefinition {
//   return {
//     name: "Test",
//     description: "This is a test",
//     parameters: {
//       type: "object",
//       properties: {
//         reportTitle: {
//           type: "string",
//           description: "The title of the report.",
//         },
//         reportSubhead: {
//           type: "string",
//           description:
//             "A more detailed description of the report for us in describing what can be found.",
//         },
//       },
//       required: ["reportTitle", "reportSubhead"],
//     },
//   };
// }
