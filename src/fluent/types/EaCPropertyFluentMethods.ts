import { EverythingAsCode, RemoveIndexSignature } from "../.deps.ts";
import { SelectEaCFluentMethods } from "./SelectEaCFluentMethods.ts";
import { SelectFluentBuilder } from "./SelectFluentBuilder.ts";

export type EaCPropertyFluentMethods<
  T,
  K extends keyof T,
  TEaC extends EverythingAsCode,
> = (
  input: T[K],
) =>
  & SelectFluentBuilder<TEaC>
  & SelectEaCFluentMethods<Omit<RemoveIndexSignature<T>, K>, TEaC>;
