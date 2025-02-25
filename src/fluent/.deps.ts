export { merge } from "jsr:@fathym/common@0.2.179/merge";
export type {
  ExcludeKeysByPrefix,
  IsNotUndefined,
  IsObject,
  IsUndefined,
  NoPropertiesUndefined,
  RemoveIndexSignatures,
  ValueType,
} from "jsr:@fathym/common@0.2.179/types";

export type {
  EaCDetails,
  EaCVertexDetails,
  EverythingAsCode,
} from "jsr:@fathym/eac@0.2.91";
export type { EaCDistributedFileSystemDetails } from "jsr:@fathym/eac@0.2.91/dfs";
export type {
  EaCAsCodeDetails,
  HasDetailsProperty,
  IsRequiredProperty,
  OptionalProperties,
  // RequiredProperties,
} from "jsr:@fathym/eac@0.2.91/types";

export type { EaCDenoKVAsCode } from "jsr:@fathym/eac-deno-kv@0.0.11";

export { IoCContainer } from "jsr:@fathym/ioc@0.0.14";

export * from "../.exports.ts";
