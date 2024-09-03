// import { EverythingAsCode, ExcludeKeysByPrefix, ValueType } from "../.deps.ts";
// import { SelectEaCFluentMethods } from "./SelectEaCFluentMethods.ts";
// import { SelectFluentBuilder } from "./SelectFluentBuilder.ts";

// export type EaCAsCodeFluentMethods<
//   T,
//   K extends keyof T,
//   TEaC extends EverythingAsCode,
// > = (
//   lookup: string,
// ) =>
//   & SelectFluentBuilder<ValueType<ExcludeKeysByPrefix<T[K], "$">>, TEaC>
//   & SelectEaCFluentMethods<ValueType<ExcludeKeysByPrefix<T[K], "$">>, TEaC>;
