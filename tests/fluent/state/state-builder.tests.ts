import { assertEquals, z, zodToJsonSchema } from "../../tests.deps.ts";
import {
  BuildState,
  InferSynapticState,
  InputBuilder,
  StateBuilder,
} from "../../../mod.ts";

Deno.test("BuildState infers state type", () => {
  const state = BuildState((s) =>
    s.Field("messages", {
      reducer: (x: string[], y: string[]) => x.concat(y),
      default: () => [],
    }).Field("count", {
      reducer: (x: number, y: number) => x + y,
      default: () => 0,
    })
  );

  type InferredState = InferSynapticState<typeof state>;

  const sample: InferredState = {
    messages: ["hi"],
    count: 1,
  };

  assertEquals(sample.count, 1);
});

Deno.test("State and Input builders generate Zod schema", () => {
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
