import { Annotation, type BinaryOperatorAggregate } from "../../src.deps.ts";

export interface StateBuilderFieldOptions<T> {
  reducer?: (state: T, update: T) => T;
  default?: () => T;
}

export class StateBuilder<
  TState extends Record<string, unknown> = Record<PropertyKey, never>,
> {
  // deno-lint-ignore no-explicit-any
  protected schema: Record<string, BinaryOperatorAggregate<any, any>> = {};

  Field<K extends string, V>(
    name: K,
    options: StateBuilderFieldOptions<V>,
  ): StateBuilder<TState & Record<K, V>> {
    const field = Annotation<V>({
      default: options.default,
      reducer: options.reducer ?? ((_, update) => update),
    });
    // deno-lint-ignore no-explicit-any
    this.schema[name] = field as BinaryOperatorAggregate<any, any>;

    return this as unknown as StateBuilder<TState & Record<K, V>>;
  }

  // deno-lint-ignore no-explicit-any
  Build(): Record<string, BinaryOperatorAggregate<any, any>> {
    return this.schema;
  }
}

export function BuildState<T extends Record<string, unknown>>(
  builder: (sb: StateBuilder) => StateBuilder<T>,
  // deno-lint-ignore no-explicit-any
): Record<string, BinaryOperatorAggregate<any, any>> {
  const sb = builder(new StateBuilder());
  return sb.Build();
}
