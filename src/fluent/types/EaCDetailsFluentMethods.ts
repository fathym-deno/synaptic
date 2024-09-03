import { EverythingAsCode } from "../.deps.ts";
import { SelectEaCFluentMethods } from "./SelectEaCFluentMethods.ts";
import { SelectFluentBuilder } from "./SelectFluentBuilder.ts";

export type EaCDetailsFluentMethods<
  T,
  K extends keyof T,
  TEaC extends EverythingAsCode,
> = <TDetails extends T[K] = T[K]>() =>
  & SelectFluentBuilder<T[K], TEaC>
  & SelectEaCFluentMethods<TDetails, TEaC>;
