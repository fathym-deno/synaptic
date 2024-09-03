// import { EverythingAsCode } from "../.deps.ts";
// import {
//   SelectEaCFluentMethods,
//   StripEaCFluentTag,
// } from "./SelectEaCFluentMethods.ts";
// import { SelectFluentBuilder } from "./SelectFluentBuilder.ts";

// export type EaCDetailsFluentMethods<
//   T,
//   K extends keyof T,
//   TEaC extends EverythingAsCode,
// > = <
//   TDetails extends StripEaCFluentTag<T[K]> = StripEaCFluentTag<T[K]>,
// >() =>
//   & SelectFluentBuilder<StripEaCFluentTag<T[K]>, TEaC>
//   & SelectEaCFluentMethods<TDetails, TEaC>;
