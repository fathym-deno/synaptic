import {
  EaCCircuitAsCode,
  EaCCircuitDetails,
  EaCGraphCircuitDetails,
  EverythingAsCode,
  ExcludeKeysByPrefix,
  HasDetailsProperty,
  IsObject,
  NoPropertiesUndefined,
  ValueType,
} from '../.deps.ts';
import { EaCAsCodeFluentMethods } from './EaCAsCodeFluentMethods.ts';
import { EaCDetailsFluentMethods } from './EaCDetailsFluentMethods.ts';
import { EaCObjectFluentMethods } from './EaCObjectFluentMethods.ts';
import { EaCPropertyFluentMethods } from './EaCPropertyFluentMethods.ts';

export type SelectEaCFluentMethods<T, TEaC extends EverythingAsCode> = {
  [K in keyof NoPropertiesUndefined<T> as K extends string
    ? K
    : never]: DetermineEaCFluentMethods<T, K, TEaC>;
};

export type DetermineEaCFluentMethods<
  T,
  K extends keyof T,
  TEaC extends EverythingAsCode
> = DetermineEaCFluentMethodsType<T, K> extends never
  ? EaCPropertyFluentMethods<T, K, TEaC>
  : DetermineEaCFluentMethodsType<T, K> extends infer MethodType
  ? MethodType extends ExtractExact<EaCFluentMethodsTags, 'Details'>
    ? EaCDetailsFluentMethods<T, K, TEaC>
    : MethodType extends ExtractExact<EaCFluentMethodsTags, 'Object'>
    ? EaCObjectFluentMethods<T, K, TEaC>
    : MethodType extends ExtractExact<EaCFluentMethodsTags, 'AsCode'>
    ? EaCAsCodeFluentMethods<T, K, TEaC>
    : EaCPropertyFluentMethods<T, K, TEaC>
  : EaCPropertyFluentMethods<T, K, TEaC>;

// K extends 'Details'
//   ? EaCDetailsFluentMethods<T, K, TEaC>
//   : HasDetailsProperty<T> extends true
//   ? IsObject<T[K]> extends true
//     ? SelectEaCValueTypeMethods<T, K, TEaC>
//     : EaCPropertyFluentMethods<T, K, TEaC>
//   : IsObject<T[K]> extends true
//   ? EaCObjectFluentMethods<T, K, TEaC>
//   : EaCPropertyFluentMethods<T, K, TEaC>;

//   export type DetermineEaCFluentMethods<
//   T,
//   K extends keyof T,
//   TEaC extends EverythingAsCode
// > = K extends 'Details'
//   ? EaCDetailsFluentMethods<T, K, TEaC>
//   : HasDetailsProperty<T> extends true
//   ? IsObject<T[K]> extends true
//     ? SelectEaCValueTypeMethods<T, K, TEaC>
//     : EaCPropertyFluentMethods<T, K, TEaC>
//   : IsObject<T[K]> extends true
//   ? EaCObjectFluentMethods<T, K, TEaC>
//   : EaCPropertyFluentMethods<T, K, TEaC>;

type tag = DetermineEaCFluentMethodsType<EaCCircuitAsCode, 'Details'>;

type xxx = DetermineEaCFluentMethods<
  EaCGraphCircuitDetails<any>,
  'State',
  EverythingAsCode
>;

const c: xxx = {};

c().State();

export type SelectEaCValueTypeMethods<
  T,
  K extends keyof T,
  TEaC extends EverythingAsCode
> = HasDetailsProperty<ValueType<ExcludeKeysByPrefix<T[K], '$'>>> extends true
  ? EaCAsCodeFluentMethods<T, K, TEaC>
  : EaCObjectFluentMethods<T, K, TEaC>;

export type DetermineEaCFluentMethodsType<
  T,
  K extends keyof T
> = SelectEaCFluentMethodsTag<T> extends never
  ? K extends 'Details'
    ? ExtractExact<EaCFluentMethodsTags, 'Details'>
    : HasDetailsProperty<T> extends true
    ? IsObject<T[K]> extends true
      ? HasDetailsProperty<
          ValueType<ExcludeKeysByPrefix<T[K], '$'>>
        > extends true
        ? ExtractExact<EaCFluentMethodsTags, 'AsCode'>
        : ExtractExact<EaCFluentMethodsTags, 'Object'>
      : ExtractExact<EaCFluentMethodsTags, 'Property'>
    : IsObject<T[K]> extends true
    ? ExtractExact<EaCFluentMethodsTags, 'Object'>
    : ExtractExact<EaCFluentMethodsTags, 'Property'>
  : SelectEaCFluentMethodsTag<T>;

export type SelectEaCFluentMethodsTag<T> = EaCFluentTagValue<
  T,
  'FluentMethods'
> extends infer FM
  ? FM
  : never;

export type EaCFluentTagTypes = 'FluentMethods';
export type EaCFluentMethodsTags = 'AsCode' | 'Details' | 'Object' | 'Property';
export type EaCFluentTags<TType extends EaCFluentTagTypes> =
  TType extends 'FluentMethods' ? EaCFluentMethodsTags : never;

export type EaCFluentTag<
  TType extends EaCFluentTagTypes,
  TTag extends EaCFluentMethodsTags
> = EaCTag<TType, TTag>;

export type EaCFluentTagValue<T, TType extends EaCFluentTagTypes> = EaCTagValue<
  T,
  TType
>;

type test =
  | string
  | boolean
  | complex
  | EaCFluentTag<'FluentMethods', 'Object'>;

type ExtractExact<T, Tag extends T> = Extract<Tag, T>;

type HasTypeCheck<T, U> = T extends U ? true : false;
type EaCTag<TType extends string, TValue> = { [K in `@${TType}`]: TValue };
type EaCTagValue<T, TType extends string> = T extends EaCTag<
  TType,
  infer TValue
>
  ? TValue
  : never;
type HasEaCTag<T, TTag> = true extends HasTypeCheck<T, TTag> ? true : false;

type complex = { Hello: string };

type isString = HasEaCTag<test, string>;

type isBoolean = HasEaCTag<test, boolean>;

type isNumber = HasEaCTag<test, number>;

type isTag = HasEaCTag<test, EaCFluentTag<'FluentMethods', 'Object'>>;

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
