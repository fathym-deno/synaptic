// import { EverythingAsCode, ExcludeKeysByPrefix, ValueType } from "../.deps.ts";
// import {
//   SelectEaCFluentMethods,
//   StripEaCFluentTag,
// } from "./SelectEaCFluentMethods.ts";
// import { SelectFluentBuilder } from "./SelectFluentBuilder.ts";

// export type EaCRecordFluentMethods<
//   T,
//   K extends keyof T,
//   TEaC extends EverythingAsCode,
// > = (
//   lookup: string,
// ) =>
//   & SelectFluentBuilder<
//     ValueType<ExcludeKeysByPrefix<StripEaCFluentTag<T[K]>, "$">>,
//     TEaC
//   >
//   & SelectEaCFluentMethods<
//     ValueType<ExcludeKeysByPrefix<StripEaCFluentTag<T[K]>, "$">>,
//     TEaC
//   >;
