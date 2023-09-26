import { DenoKVConversationState } from "../../src/conversations/DenoKVConversationState.ts";
import { assertEquals, assertExists } from "../tests.deps.ts";

Deno.test("DenoKVConversationState tests", async (t) => {
  const kv = await Deno.openKv();

  const convoState = new DenoKVConversationState(kv);

  const convoLookup1 = "test-convo-1";
  const convoLookup2 = "test-convo-2";

  await t.step("Conversation tests", async () => {
    await convoState.Create(convoLookup1, {
      Title: "Test Convo 1",
    });

    await convoState.Create(convoLookup2, {
      Title: "Test Convo 2",
    });
  });

  await t.step("Get Conversation test", async () => {
    const convo1 = await convoState.Get(convoLookup1);

    const convo2 = await convoState.Get(convoLookup2);

    assertEquals(convo1!.Title, "Test Convo 1");

    assertEquals(convo2!.Title, "Test Convo 2");
  });

  await t.step("Get All Conversations test", async () => {
    const convos = await convoState.GetAll();

    assertExists(convos[convoLookup1]);
    assertEquals(convos![convoLookup1].Title, "Test Convo 1");

    assertExists(convos[convoLookup2]);
    assertEquals(convos![convoLookup2].Title, "Test Convo 2");
  });

  await t.step("Add Message test", async () => {
    await convoState.Add(convoLookup1, {
      From: "bot",
      Content: "A message from the bot in convo 1",
    });

    await convoState.Add(convoLookup2, {
      From: "bot",
      Content: "A message from the bot in convo 2",
    });
  });

  await t.step("Message History test", async () => {
    const history1 = await convoState.History(convoLookup1);

    const history2 = await convoState.History(convoLookup2);

    assertEquals(history1.length, 1);
    assertEquals(history1[0].Content, "A message from the bot in convo 1");

    assertEquals(history2.length, 1);
    assertEquals(history2[0].Content, "A message from the bot in convo 2");
  });

  await t.step("Reset Conversation test", async () => {
    await convoState.Reset(convoLookup1);

    const history1 = await convoState.History(convoLookup1);

    const history2 = await convoState.History(convoLookup2);

    const convo1 = await convoState.Get(convoLookup1);

    assertEquals(history1.length, 0);

    assertEquals(history2.length, 1);

    assertEquals(convo1!.Title, "Test Convo 1");
  });

  await t.step("Delete Conversation test", async () => {
    await convoState.Delete(convoLookup1);

    await convoState.Delete(convoLookup2);

    const history1 = await convoState.History(convoLookup1);

    const history2 = await convoState.History(convoLookup2);

    const convo1 = await convoState.Get(convoLookup1);

    const convo2 = await convoState.Get(convoLookup2);

    assertEquals(history1.length, 0);

    assertEquals(history2.length, 0);

    assertEquals(convo1, null);

    assertEquals(convo2, null);
  });

  await convoState.Delete(convoLookup1);

  await convoState.Delete(convoLookup2);

  kv.close();
});
