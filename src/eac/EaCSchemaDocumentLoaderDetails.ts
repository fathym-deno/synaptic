import { JsonSchema7Type } from "../src.deps.ts";
import {
  EaCDocumentLoaderDetails,
  isEaCDocumentLoaderDetails,
} from "./EaCDocumentLoaderDetails.ts";

export type EaCSchemaDocumentLoaderDetails = {
  Schemas: Record<string, JsonSchema7Type>;
} & EaCDocumentLoaderDetails<"SchemaDocument">;

export function isEaCSchemaDocumentLoaderDetails(
  details: unknown,
): details is EaCSchemaDocumentLoaderDetails {
  const x = details as EaCSchemaDocumentLoaderDetails;

  return (
    isEaCDocumentLoaderDetails("SchemaDocument", x) &&
    typeof x.Schemas !== "undefined"
  );
}
