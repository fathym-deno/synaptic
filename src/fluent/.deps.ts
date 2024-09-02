export { merge } from 'jsr:@fathym/common@0.2.47/merge';
export type {
  IsObject,
  NoPropertiesUndefined,
  RemoveIndexSignature,
  ValueType,
} from 'jsr:@fathym/common@0.2.47/types';

export type {
  EaCDetails,
  EaCVertexDetails,
  EverythingAsCode,
} from 'jsr:@fathym/eac@0.1.36';
export type { EaCDatabaseAsCode } from 'jsr:@fathym/eac@0.1.36/databases';
export type { EaCDistributedFileSystemDetails } from 'jsr:@fathym/eac@0.1.36/dfs';
export type {
  EaCAsCodeDetails,
  HasDetailsProperty,
  IsRequiredProperty,
  OptionalProperties,
  RequiredProperties,
} from 'jsr:@fathym/eac@0.1.36/types';

export {
  type EaCRuntimePlugin,
  FathymDFSFileHandlerPlugin,
  FathymEaCServicesPlugin,
} from 'jsr:@fathym/eac-runtime@0.1.20';

export { IoCContainer } from 'jsr:@fathym/ioc@0.0.12';

export * from '../.exports.ts';