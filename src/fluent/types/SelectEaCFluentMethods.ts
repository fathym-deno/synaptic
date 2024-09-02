import {
  EaCAIAsCode,
  EaCAIDetails,
  EverythingAsCode,
  EverythingAsCodeSynaptic,
  HasDetailsProperty,
  IsNotUndefined,
  IsObject,
  IsRequiredProperty,
  IsUndefined,
  NoPropertiesUndefined,
  OptionalProperties,
  RemoveIndexSignature,
  RequiredProperties,
  ValueType,
} from '../.deps.ts';
import { EaCAsCodeFluentMethods } from './EaCAsCodeFluentMethods.ts';
import { EaCDetailsFluentMethods } from './EaCDetailsFluentMethods.ts';
import { EaCObjectFluentMethods } from './EaCObjectFluentMethods.ts';
import { EaCPropertyFluentMethods } from './EaCPropertyFluentMethods.ts';

type c = IsUndefined<EaCAIDetails['Name']>;
type cc = IsRequiredProperty<EaCAIDetails, 'Name'>;

type x = NoPropertiesUndefined<RequiredProperties<EverythingAsCodeSynaptic>>;
type xx = NoPropertiesUndefined<RequiredProperties<EaCAIAsCode>>;
type xxx = NoPropertiesUndefined<RequiredProperties<EaCAIDetails>>;

type y = NoPropertiesUndefined<OptionalProperties<EverythingAsCodeSynaptic>>;
type yy = NoPropertiesUndefined<OptionalProperties<EaCAIAsCode>>;
type yyy = NoPropertiesUndefined<OptionalProperties<EaCAIDetails>>;

export type SelectEaCFluentMethods<T, TEaC extends EverythingAsCode> = {
  [K in keyof NoPropertiesUndefined<T> as K extends string
    ? K
    : never]: DetermineEaCFluentMethods<T, K, TEaC>;
};
// export type SelectEaCFluentMethods<T, TEaC extends EverythingAsCode> = {
//   [K in keyof NoPropertiesUndefined<RequiredProperties<T>> as K extends string
//     ? K
//     : never]: DetermineEaCFluentMethods<T, K, TEaC>;
// } & {
//   $Optional: {
//     [K in keyof NoPropertiesUndefined<OptionalProperties<T>> as K extends string
//       ? K
//       : never]: DetermineEaCFluentMethods<T, K, TEaC>;
//   };
// };

export type DetermineEaCFluentMethods<
  T,
  K extends keyof T,
  TEaC extends EverythingAsCode
> = K extends 'Details'
  ? EaCDetailsFluentMethods<T, K, TEaC>
  : HasDetailsProperty<T> extends true
  ? IsObject<T[K]> extends true
    ? SelectEaCValueTypeMethods<T, K, TEaC>
    : EaCPropertyFluentMethods<T, K, TEaC>
  : IsObject<T[K]> extends true
  ? EaCObjectFluentMethods<T, K, TEaC>
  : EaCPropertyFluentMethods<T, K, TEaC>;

export type SelectEaCValueTypeMethods<
  T,
  K extends keyof T,
  TEaC extends EverythingAsCode
> = HasDetailsProperty<ValueType<T[K]>> extends true
  ? EaCAsCodeFluentMethods<T, K, TEaC>
  : EaCObjectFluentMethods<T, K, TEaC>;
