// deno-lint-ignore-file no-explicit-any
import { z, type ZodObject, type ZodRawShape } from "../../src.deps.ts";
import { InferSynapticState } from "../../utils/types.ts";

export function InputBuilder<
  TStateSchema extends Record<string, unknown>,
  TAdditional extends ZodRawShape,
>(
  _state: TStateSchema,
  additional: TAdditional,
): {
  Schema: z.ZodObject<TAdditional, z.UnknownKeysParam, z.ZodTypeAny>;
  Type:
    & Partial<InferSynapticState<TStateSchema>>
    & {
      [
        k in keyof z.objectUtil.addQuestionMarks<
          z.baseObjectOutputType<TAdditional>,
          any
        >
      ]: z.objectUtil.addQuestionMarks<
        z.baseObjectOutputType<TAdditional>,
        any
      >[k];
    };
} {
  const schema = z.object(additional) as ZodObject<TAdditional>;
  type Input =
    & Partial<InferSynapticState<TStateSchema>>
    & z.infer<typeof schema>;
  return { Schema: schema, Type: {} as Input };
}
