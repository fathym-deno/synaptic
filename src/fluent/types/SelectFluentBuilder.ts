// import { HasDetailsProperty, ValueType } from '../.deps.ts';
import { EverythingAsCode, IsObject } from '../.deps.ts';
import { EaCFluentBuilder } from '../EaCFluentBuilder.ts';
import { EaCFluentBuilderProxy } from '../EaCFluentBuilderProxy.ts';
// import { EnsuredEaCAsCodeFluentBuilder } from './EnsuredEaCAsCodeFluentBuilder.ts';
// import { EnsuredEaCFluentBuilder } from './EnsuredEaCFluentBuilder.ts';

export type SelectFluentBuilder<
  T,
  TEaC extends EverythingAsCode
> = EaCFluentBuilder<TEaC>;
// IsObject<T> extends true
//   ? EaCFluentBuilder<TEaC>
//   : EaCFluentBuilderProxy<TEaC>;
