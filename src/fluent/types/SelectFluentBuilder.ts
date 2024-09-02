// import { HasDetailsProperty, ValueType } from '../.deps.ts';
import { EverythingAsCode } from '../.deps.ts';
import { EaCFluentBuilder } from '../EaCFluentBuilder.ts';
// import { EnsuredEaCAsCodeFluentBuilder } from './EnsuredEaCAsCodeFluentBuilder.ts';
// import { EnsuredEaCFluentBuilder } from './EnsuredEaCFluentBuilder.ts';

export type SelectFluentBuilder<TEaC extends EverythingAsCode> =
  EaCFluentBuilder<TEaC>;
