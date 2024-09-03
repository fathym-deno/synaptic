// // deno-lint-ignore-file no-explicit-any
// import { StateDefinition } from "../../src.deps.ts";
// import {
//   EaCGraphCircuitDetails,
//   EverythingAsCode,
//   ExcludeKeysByPrefix,
//   HasDetailsProperty,
//   IsObject,
//   NoPropertiesUndefined,
//   ValueType,
// } from "../.deps.ts";
// import { EaCRecordFluentMethods } from "./EaCRecordFluentMethods.ts";
// import { EaCDetailsFluentMethods } from "./EaCDetailsFluentMethods.ts";
// import { EaCObjectFluentMethods } from "./EaCObjectFluentMethods.ts";
// import { EaCPropertyFluentMethods } from "./EaCPropertyFluentMethods.ts";
// import { EaCAsCodeFluentMethods } from "./EaCAsCodeFluentMethods.ts";

// export type SelectEaCFluentMethods<T, TEaC extends EverythingAsCode> = {
//   [
//     K in keyof NoPropertiesUndefined<T> as K extends string ? K
//       : never
//   ]: DetermineEaCFluentMethods<T, K, TEaC>;
// };

// export type EaCFluentMethodMap<
//   T,
//   K extends keyof T,
//   TEaC extends EverythingAsCode,
// > = {
//   AsCode: EaCAsCodeFluentMethods<T, K, TEaC>;
//   Details: EaCDetailsFluentMethods<T, K, TEaC>;
//   Object: EaCObjectFluentMethods<T, K, TEaC>;
//   Property: EaCPropertyFluentMethods<T, K, TEaC>;
//   Record: EaCRecordFluentMethods<T, K, TEaC>;
// };

// export type EaCDefaultFluentMethods<
//   T,
//   K extends keyof T,
//   TEaC extends EverythingAsCode,
// > = EaCFluentMethodMap<T, K, TEaC>["Property"];

// export type DetermineEaCFluentMethods<
//   T,
//   K extends keyof T,
//   TEaC extends EverythingAsCode,
// > = DetermineEaCFluentMethodsType<T, K> extends infer MethodType
//   ? MethodType extends keyof EaCFluentMethodMap<T, K, TEaC>
//     ? EaCFluentMethodMap<T, K, TEaC>[MethodType]
//   : EaCDefaultFluentMethods<T, K, TEaC>
//   : EaCDefaultFluentMethods<T, K, TEaC>;

// // Determine the default method type based on conditions
// type DefaultMethodType<T, K extends keyof T> = K extends "Details"
//   ? ExtractExact<EaCFluentMethodsTags, "Details">
//   : IsObject<T[K]> extends true
//     ? HasDetailsProperty<ValueType<ExcludeKeysByPrefix<T[K], "$">>> extends true
//       ? ExtractExact<EaCFluentMethodsTags, "Record">
//     : ExtractExact<EaCFluentMethodsTags, "Object">
//   : ExtractExact<EaCFluentMethodsTags, "Property">;

// export type DetermineEaCFluentMethodsType<
//   T,
//   K extends keyof T,
// > = SelectEaCFluentMethodsTag<T[K]> extends [never] ? DefaultMethodType<T, K>
//   : SelectEaCFluentMethodsTag<T[K]>;

// type d = ExtractEaCFluentTag<EaCGraphCircuitDetails["State"], "FluentMethods">;
// type dd = SelectEaCFluentMethodsTag<EaCGraphCircuitDetails["State"]>;
// type dddd = DetermineEaCFluentMethodsType<EaCGraphCircuitDetails, "State">;

// export type SelectEaCFluentMethodsTag<T> = ExtractEaCFluentTag<
//   T,
//   "FluentMethods"
// > extends infer FM ? FM
//   : never;

// export type EaCFluentTagTypes = "FluentMethods";
// export type EaCFluentMethodsTags =
//   | "AsCode"
//   | "Record"
//   | "Details"
//   | "Object"
//   | "Property";
// export type EaCFluentTags<TType extends EaCFluentTagTypes> = TType extends
//   "FluentMethods" ? EaCFluentMethodsTags : never;

// export type EaCFluentTag<
//   TType extends EaCFluentTagTypes = EaCFluentTagTypes,
//   TTag extends EaCFluentMethodsTags = EaCFluentMethodsTags,
// > = EaCTag<TType, TTag>;

// /**
//  * Recursive utility type to apply StripEaCFluentTag across an entire object tree, including tuples and arrays
//  */
// export type HasEaCFluentTag<
//   T,
//   TType extends EaCFluentTagTypes = EaCFluentTagTypes,
//   TTag extends EaCFluentMethodsTags = EaCFluentMethodsTags,
// > = HasEaCTag<T, EaCTag<TType, TTag>>;

// export type StripEaCFluentTag<
//   T,
//   TType extends EaCFluentTagTypes = EaCFluentTagTypes,
//   TTag extends EaCFluentMethodsTags = EaCFluentMethodsTags,
// > = StripEaCTag<T, TType, TTag>;

// export type DeepStripEaCFluentTag<
//   T,
//   TType extends EaCFluentTagTypes = EaCFluentTagTypes,
//   TTag extends EaCFluentMethodsTags = EaCFluentMethodsTags,
// > = DeepStripEaCTag<T, TType, TTag>;

// export type ExtractEaCFluentTag<
//   T,
//   TType extends EaCFluentTagTypes,
// > = ExtractEaCTag<T, TType>;

// type ExtractExact<T, Tag extends T> = Extract<Tag, T>;

// type HasTypeCheck<T, U> = T extends U ? true : false;
// type EaCTag<TType extends string, TTag, TValue = never> =
//   & {
//     [K in `@${TType}`]?: TTag;
//   }
//   & { [K in `@${TType}-value`]?: TValue };
// type ExtractEaCTag<T, TType extends string> = T extends EaCTag<
//   TType,
//   infer TTag
// > ? TTag
//   : never;
// type HasEaCTag<T, TTag> = true extends HasTypeCheck<
//   NonNullable<T>,
//   NonNullable<TTag>
// > ? true
//   : false;

// /**
//  * Utility type to remove EaCFluentTag from a single property
//  */
// type StripEaCTag<
//   T,
//   TType extends string,
//   TTag = any,
// > = NonNullable<T> extends EaCTag<NonNullable<TType>, NonNullable<TTag>>
//   ? Omit<NonNullable<T>, keyof EaCTag<NonNullable<TType>, NonNullable<TTag>>>
//   : NonNullable<T>;
// // type StripEaCTag<T> = {
// //   [K in keyof T as T[K] extends EaCTag<infer TType, any> ? never : K]: T[K];
// // };

// type DeepStripEaCTag<T, TType extends string, TTag = any> = StripEaCTag<
//   {
//     [K in keyof T]: T[K] extends never ? never
//       : T[K] extends (infer U)[] ? DeepStripEaCTag<U, TType, TTag>[]
//       : T extends object ? DeepStripEaCTag<T[K], TType, TTag>
//       : StripEaCTag<T[K], TType, TTag>;
//   },
//   TType,
//   TTag
// >;

// type shasTag = HasEaCTag<
//   EaCGraphCircuitDetails["State"],
//   EaCFluentTag<"FluentMethods", "Property">
// >;
// type t1 = EaCGraphCircuitDetails["State"];
// type stripped = DeepStripEaCFluentTag<EaCGraphCircuitDetails>;
// type shasTag2 = HasEaCTag<
//   stripped["State"],
//   EaCFluentTag<"FluentMethods", "Property">
// >;
// type t2 = stripped["State"];

// type State = StateDefinition & EaCFluentTag<"FluentMethods", "Property">;
// type hasTag = HasEaCTag<State, EaCFluentTag<"FluentMethods", "Property">>;
// type xState = DeepStripEaCFluentTag<State, "FluentMethods", "Property">;
// type xState2 = StripEaCFluentTag<State, "FluentMethods", "Property">;
// type hasTag2 = HasEaCTag<xState, EaCFluentTag<"FluentMethods", "Property">>;

// // type c = IsUndefined<EaCAIDetails['Name']>;
// // type cc = IsRequiredProperty<EaCAIDetails, 'Name'>;

// // type x = NoPropertiesUndefined<RequiredProperties<EverythingAsCodeSynaptic>>;
// // type xx = NoPropertiesUndefined<RequiredProperties<EaCAIAsCode>>;
// // type xxx = NoPropertiesUndefined<RequiredProperties<EaCAIDetails>>;

// // type y = NoPropertiesUndefined<OptionalProperties<EverythingAsCodeSynaptic>>;
// // type yy = NoPropertiesUndefined<OptionalProperties<EaCAIAsCode>>;
// // type yyy = NoPropertiesUndefined<OptionalProperties<EaCAIDetails>>;

// // export type SelectEaCFluentMethods<T, TEaC extends EverythingAsCode> = {
// //   [K in keyof NoPropertiesUndefined<RequiredProperties<T>> as K extends string
// //     ? K
// //     : never]: DetermineEaCFluentMethods<T, K, TEaC>;
// // } & {
// //   $Optional: {
// //     [K in keyof NoPropertiesUndefined<OptionalProperties<T>> as K extends string
// //       ? K
// //       : never]: DetermineEaCFluentMethods<T, K, TEaC>;
// //   };
// // };
