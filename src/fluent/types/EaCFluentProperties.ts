import {
  NoPropertiesUndefined,
  OptionalProperties,
  RequiredProperties,
} from "../.deps.ts";

export type EaCFluentProperties<T> = RequiredProperties<T> & {
  Optional: NoPropertiesUndefined<OptionalProperties<T>>;
};
