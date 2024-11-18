export { merge } from "jsr:@fathym/common@0.2.167/merge";
export type {
  ExcludeKeysByPrefix,
  IsNotUndefined,
  IsObject,
  IsUndefined,
  NoPropertiesUndefined,
  RemoveIndexSignatures,
  ValueType,
} from "jsr:@fathym/common@0.2.167/types";

export type {
  EaCDetails,
  EaCVertexDetails,
  EverythingAsCode,
} from "jsr:@fathym/eac@0.2.13";

export type { EaCDenoKVAsCode } from "jsr:@fathym/eac-deno-kv@0.0.4";

export type { EaCDistributedFileSystemDetails } from "jsr:@fathym/eac-dfs@0.0.15";

export type {
  EaCAsCodeDetails,
  HasDetailsProperty,
  IsRequiredProperty,
  OptionalProperties,
  // RequiredProperties,
} from "jsr:@fathym/eac@0.2.13/types";

export {
  type EaCRuntimePlugin,
  FathymDFSFileHandlerPlugin,
  FathymEaCServicesPlugin,
} from "jsr:@fathym/eac-runtime@0.1.21";

export { IoCContainer } from "jsr:@fathym/ioc@0.0.12";

export * from "../.exports.ts";
