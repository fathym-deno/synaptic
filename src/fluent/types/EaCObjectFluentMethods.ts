import { EverythingAsCode } from "../.deps.ts";
import { SelectEaCFluentMethods } from "./SelectEaCFluentMethods.ts";
import { SelectFluentBuilder } from "./SelectFluentBuilder.ts";

export type EaCObjectFluentMethods<
  T,
  K extends keyof T,
  TEaC extends EverythingAsCode,
> = () => SelectFluentBuilder<T[K], TEaC> & SelectEaCFluentMethods<T[K], TEaC>;
