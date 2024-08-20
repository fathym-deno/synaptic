import { customStringify } from "../../src/plugins/customStringify.ts";
import {
  assert,
  assertEquals,
  HumanMessage,
  jsonMapSetClone,
  merge,
} from "../tests.deps.ts";

Deno.test("Message Serialization", async (t) => {
  await t.step("Human Message", () => {
    const msg = new HumanMessage("This is a test");

    // deno-lint-ignore no-explicit-any
    const newMsg = merge<any>(
      jsonMapSetClone(msg),
      JSON.parse(customStringify(msg)),
    );

    console.log(newMsg);

    assert(newMsg);
    assert(newMsg.additional_kwargs);
    assert(newMsg.content, "This is a test");
    assertEquals(newMsg.type, "HumanMessage");
  });

  await t.step("Human Message Array", () => {
    const msg = new HumanMessage("This is a test");

    // deno-lint-ignore no-explicit-any
    const newMsg = merge<any>(
      jsonMapSetClone(msg),
      JSON.parse(customStringify(msg)),
    );

    console.log(newMsg);

    assert(newMsg);
    assert(newMsg.additional_kwargs);
    assert(newMsg.content, "This is a test");
    assertEquals(newMsg.type, "HumanMessage");
  });
});
