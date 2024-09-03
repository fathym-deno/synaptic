import { StateDefinition } from "../../src.deps.ts";
import {
  EaCGraphCircuitDetails,
  EverythingAsCode,
  ExcludeKeysByPrefix,
  HasDetailsProperty,
  IsObject,
  NoPropertiesUndefined,
  ValueType,
} from "../.deps.ts";
import { EaCAsCodeFluentMethods } from "./EaCAsCodeFluentMethods.ts";
import { EaCDetailsFluentMethods } from "./EaCDetailsFluentMethods.ts";
import { EaCObjectFluentMethods } from "./EaCObjectFluentMethods.ts";
import { EaCPropertyFluentMethods } from "./EaCPropertyFluentMethods.ts";

export type SelectEaCFluentMethods<T, TEaC extends EverythingAsCode> = {
  [
    K in keyof NoPropertiesUndefined<T> as K extends string ? K
      : never
  ]: DetermineEaCFluentMethods<T, K, TEaC>;
};

export type DetermineEaCFluentMethods<
  T,
  K extends keyof T,
  TEaC extends EverythingAsCode,
> = DetermineEaCFluentMethodsType<T, K> extends never
  ? EaCPropertyFluentMethods<T, K, TEaC>
  : DetermineEaCFluentMethodsType<T, K> extends infer MethodType
    ? MethodType extends ExtractExact<EaCFluentMethodsTags, "Details">
      ? EaCDetailsFluentMethods<T, K, TEaC>
    : MethodType extends ExtractExact<EaCFluentMethodsTags, "Object">
      ? EaCObjectFluentMethods<T, K, TEaC>
    : MethodType extends ExtractExact<EaCFluentMethodsTags, "Record">
      ? EaCAsCodeFluentMethods<T, K, TEaC>
    : EaCPropertyFluentMethods<T, K, TEaC>
  : EaCPropertyFluentMethods<T, K, TEaC>;

export type SelectEaCValueTypeMethods<
  T,
  K extends keyof T,
  TEaC extends EverythingAsCode,
> = HasDetailsProperty<ValueType<ExcludeKeysByPrefix<T[K], "$">>> extends true
  ? EaCAsCodeFluentMethods<T, K, TEaC>
  : EaCObjectFluentMethods<T, K, TEaC>;

export type DetermineEaCFluentMethodsType<
  T,
  K extends keyof T,
> = SelectEaCFluentMethodsTag<T> extends never
  ? K extends "Details" ? ExtractExact<EaCFluentMethodsTags, "Details">
  : HasDetailsProperty<T> extends true
    ? IsObject<T[K]> extends true ? HasDetailsProperty<
        ValueType<ExcludeKeysByPrefix<T[K], "$">>
      > extends true ? ExtractExact<EaCFluentMethodsTags, "Record">
      : ExtractExact<EaCFluentMethodsTags, "Object">
    : ExtractExact<EaCFluentMethodsTags, "Property">
  : IsObject<T[K]> extends true ? ExtractExact<EaCFluentMethodsTags, "Object">
  : ExtractExact<EaCFluentMethodsTags, "Property">
  : SelectEaCFluentMethodsTag<T>;

export type SelectEaCFluentMethodsTag<T> = EaCFluentTagValue<
  T,
  "FluentMethods"
> extends infer FM ? FM
  : never;

export type EaCFluentTagTypes = "FluentMethods";
export type EaCFluentMethodsTags = "Record" | "Details" | "Object" | "Property";
export type EaCFluentTags<TType extends EaCFluentTagTypes> = TType extends
  "FluentMethods" ? EaCFluentMethodsTags : never;

export type EaCFluentTag<
  TType extends EaCFluentTagTypes,
  TTag extends EaCFluentMethodsTags,
> = EaCTag<TType, TTag>;

export type EaCFluentTagValue<T, TType extends EaCFluentTagTypes> = EaCTagValue<
  T,
  TType
>;

type ExtractExact<T, Tag extends T> = Extract<Tag, T>;

type HasTypeCheck<T, U> = T extends U ? true : false;
type EaCTag<TType extends string, TValue> = { [K in `@${TType}`]: TValue };
type EaCTagValue<T, TType extends string> = T extends EaCTag<
  TType,
  infer TValue
> ? TValue
  : never;
type HasEaCTag<T, TTag> = true extends HasTypeCheck<T, TTag> ? true : false;

/**
 * Utility type to remove EaCFluentTag from a single property
 */
type StripEaCTag<T> = T extends EaCTag<"FluentMethods", infer U>
  ? Omit<T, keyof EaCTag<"FluentMethods", U>>
  : T;

/**
 * Recursive utility type to apply StripEaCFluentTag across an entire object tree, including tuples and arrays
 */
// type DeepStripEaCTag<T> = T extends (infer U)[]
//   ? DeepStripEaCTag<U>[] // Handle arrays
//   : T extends [...infer U]
//   ? { [K in keyof U]: DeepStripEaCTag<U[K]> } // Handle tuples
//   : T extends object
//   ? { [K in keyof T]: DeepStripEaCTag<StripEaCTag<T[K]>> }
//   : StripEaCTag<T>;
type DeepStripEaCTag<T> = StripEaCTag<
  {
    [K in keyof T]: T[K] extends never ? never
      : T[K] extends (infer U)[] ? DeepStripEaCTag<U>[]
      // : T extends [...infer U]
      // ? DeepStripEaCTag<{ [K in keyof U]: never }> //U[K]
      : T extends object ? DeepStripEaCTag<T[K]>
      : StripEaCTag<T[K]>;
  }
>;

type shasTag = HasEaCTag<
  EaCGraphCircuitDetails["State"],
  EaCFluentTag<"FluentMethods", "Property">
>;
type stripped = DeepStripEaCTag<EaCGraphCircuitDetails>;
type shasTag2 = HasEaCTag<
  stripped["State"],
  EaCFluentTag<"FluentMethods", "Property">
>;

type State = StateDefinition & EaCFluentTag<"FluentMethods", "Property">;
type hasTag = HasEaCTag<State, EaCFluentTag<"FluentMethods", "Property">>;
type xState = StripEaCTag<State>;
type hasTag2 = HasEaCTag<xState, EaCFluentTag<"FluentMethods", "Property">>;

// type c = IsUndefined<EaCAIDetails['Name']>;
// type cc = IsRequiredProperty<EaCAIDetails, 'Name'>;

// type x = NoPropertiesUndefined<RequiredProperties<EverythingAsCodeSynaptic>>;
// type xx = NoPropertiesUndefined<RequiredProperties<EaCAIAsCode>>;
// type xxx = NoPropertiesUndefined<RequiredProperties<EaCAIDetails>>;

// type y = NoPropertiesUndefined<OptionalProperties<EverythingAsCodeSynaptic>>;
// type yy = NoPropertiesUndefined<OptionalProperties<EaCAIAsCode>>;
// type yyy = NoPropertiesUndefined<OptionalProperties<EaCAIDetails>>;

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
