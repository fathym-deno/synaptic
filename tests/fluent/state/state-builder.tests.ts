import { assertEquals, z, zodToJsonSchema } from "../../tests.deps.ts";
import { InputBuilder, StateBuilder } from "../../../mod.ts";

Deno.test("State and Input builders", () => {
  const state = new StateBuilder()
    .Field("messages", {
      reducer: (x: string[], y: string[]) => x.concat(y),
      default: () => [],
    })
    .Build();

  const input = InputBuilder(state, {
    Input: z.string().optional(),
  });

  const manual = z.object({
    Input: z.string().optional(),
  });

  assertEquals(
    zodToJsonSchema(input.Schema),
    zodToJsonSchema(manual),
  );
});
