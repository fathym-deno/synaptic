// import { EverythingAsCode, RemoveIndexSignature } from "../.deps.ts";
// import {
//   SelectEaCFluentMethods,
//   StripEaCFluentTag,
// } from "./SelectEaCFluentMethods.ts";
// import { SelectFluentBuilder } from "./SelectFluentBuilder.ts";

// export type EaCPropertyFluentMethods<
//   T,
//   K extends keyof T,
//   TEaC extends EverythingAsCode,
// > = (
//   input: T[K], //HasEaCFluentTag<> extends true ? StripEaCFluentTag<T[K]> : T[K],
// ) =>
//   & SelectFluentBuilder<StripEaCFluentTag<T[K]>, TEaC>
//   & SelectEaCFluentMethods<Omit<RemoveIndexSignature<T>, K>, TEaC>;
