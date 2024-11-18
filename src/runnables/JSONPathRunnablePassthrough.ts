// deno-lint-ignore-file no-explicit-any
import { jsonpath, RunnableConfig, RunnablePassthrough } from "../src.deps.ts";

export class JSONPathRunnablePassthrough<
  RunInput = any,
> extends RunnablePassthrough<RunInput> {
  constructor(protected jsonPath: string) {
    super();
  }

  public override async invoke(
    input: RunInput,
    options?: Partial<RunnableConfig>,
  ): Promise<RunInput> {
    input = this.jsonPath ? jsonpath.query(input, this.jsonPath)[0] : input;

    return await super.invoke(input, options);
  }
}
