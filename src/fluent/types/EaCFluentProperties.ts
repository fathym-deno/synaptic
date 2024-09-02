import {
  NoPropertiesUndefined,
  OptionalProperties,
  RequiredProperties,
} from '../.deps.ts';

// HasDetailsProperty<
//   ValueType<TAsCode[K]>
// > extends true
//   ? EnsuredEaCAsCodeFluentBuilder<ValueType<TAsCode[K]>>
//   : EnsuredEaCFluentBuilder<TAsCode>;
// export type EaCFluentProperties<T> = RequiredProperties<T> & {
//   Optional: NoPropertiesUndefined<OptionalProperties<T>>;
// };
