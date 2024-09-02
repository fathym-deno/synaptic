import { EverythingAsCode, ValueType } from '../.deps.ts';
import { SelectEaCFluentMethods } from './SelectEaCFluentMethods.ts';
import { SelectFluentBuilder } from './SelectFluentBuilder.ts';

export type EaCAsCodeFluentMethods<
  T,
  K extends keyof T,
  TEaC extends EverythingAsCode
> = (
  lookup: string
) => SelectFluentBuilder<TEaC> & SelectEaCFluentMethods<ValueType<T[K]>, TEaC>;
