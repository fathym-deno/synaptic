import { Annotation } from "../../src.deps.ts";

export interface StateBuilderFieldOptions<T> {
  reducer?: (state: T, update: T) => T;
  default?: () => T;
}

export class StateBuilder<
  TState extends Record<string, unknown> = Record<PropertyKey, never>,
> {
  protected schema: Record<string, ReturnType<typeof Annotation>> = {};

  Field<K extends string, V>(
    name: K,
    options: StateBuilderFieldOptions<V>,
  ): StateBuilder<TState & Record<K, V>> {
    this.schema[name] = Annotation<V>({
      default: options.default,
      reducer: options.reducer,
    });

    return this as unknown as StateBuilder<TState & Record<K, V>>;
  }

  Build() {
    return this.schema;
  }
}

export function BuildState<T>(
  builder: (sb: StateBuilder) => StateBuilder<T>,
): Record<string, ReturnType<typeof Annotation>> {
  const sb = builder(new StateBuilder());
  return sb.Build();
}
