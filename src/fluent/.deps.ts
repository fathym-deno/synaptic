export { merge } from 'jsr:@fathym/common@0.2.145/merge';
export type {
  ExcludeKeysByPrefix,
  IsNativeType,
  IsNotUndefined,
  IsObject,
  IsObjectNotNative,
  IsUndefined,
  NoPropertiesUndefined,
  RemoveIndexSignatures,
  ValueType,
} from 'jsr:@fathym/common@0.2.145/types';
// } from '../../../reference-architecture/src/common/types/.exports.ts';

export type {
  $FluentTag,
  FluentBuilder,
  FluentBuilderMethodsHandlers,
  FluentBuilderRoot,
  SelectFluentMethods,
} from 'jsr:@fathym/common@0.2.145/fluent';
// } from '../../../reference-architecture/src/fluent/.exports.ts';

export type {
  EaCDetails,
  EaCVertexDetails,
  EverythingAsCode,
} from 'jsr:@fathym/eac@0.1.60';
export type { EaCDatabaseAsCode } from 'jsr:@fathym/eac@0.1.60/databases';
export type { EaCDistributedFileSystemDetails } from 'jsr:@fathym/eac@0.1.60/dfs';
export {
  eacFluentBuilder,
  type EverythingAsCodeTags,
  // } from "jsr:@fathym/eac@0.1.60/fluent";
} from '../../../everything-as-code/src/fluent/.exports.ts';
export type {
  EaCAsCodeDetails,
  HasDetailsProperty,
  IsRequiredProperty,
  OptionalProperties,
  RequiredProperties,
} from 'jsr:@fathym/eac@0.1.60/types';

export {
  type EaCRuntimePlugin,
  FathymDFSFileHandlerPlugin,
  FathymEaCServicesPlugin,
} from 'jsr:@fathym/eac-runtime@0.1.21';

export { IoCContainer } from 'jsr:@fathym/ioc@0.0.12';

export * from '../.exports.ts';
