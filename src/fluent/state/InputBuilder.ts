import { z, type ZodObject, type ZodRawShape } from "../../src.deps.ts";
import { InferSynapticState } from "../../utils/types.ts";

export function InputBuilder<
  TStateSchema extends Record<string, unknown>,
  TAdditional extends ZodRawShape,
>(_state: TStateSchema, additional: TAdditional) {
  const schema = z.object(additional) as ZodObject<TAdditional>;
  type Input =
    & Partial<InferSynapticState<TStateSchema>>
    & z.infer<typeof schema>;
  return { Schema: schema, Type: {} as Input };
}
