import { EaCVertexDetails, EaCVertexDetailsSchema, z } from "./.deps.ts";

/**
 * Represents AI-specific details in the Everything as Code (EaC) framework.
 */
export type EaCAIDetails = EaCVertexDetails;

/**
 * Schema for `EaCAIDetails` using the base `EaCVertexDetailsSchema`.
 */
export const EaCAIDetailsSchema: z.ZodObject<
  {
    Description: z.ZodOptional<z.ZodString>;
    Name: z.ZodOptional<z.ZodString>;
  },
  "strip",
  z.ZodTypeAny,
  EaCAIDetails,
  EaCAIDetails
> = EaCVertexDetailsSchema.describe(
  "Schema for `EaCAIDetails`, inheriting from `EaCVertexDetails`. This schema defines optional AI-specific vertex details, including a description and a name for identification.",
);

/**
 * Type guard for `EaCAIDetails` using schema validation.
 *
 * @param details - The object to validate.
 * @returns True if the object is a valid `EaCAIDetails`, false otherwise.
 */
export function isEaCAIDetails(details: unknown): details is EaCAIDetails {
  return EaCAIDetailsSchema.safeParse(details).success;
}

/**
 * Validates and parses an object as `EaCAIDetails`.
 *
 * @param details - The object to validate and parse.
 * @throws If the object does not conform to the `EaCAIDetails` schema.
 * @returns The parsed `EaCAIDetails` object.
 */
export function parseEaCAIDetails(details: unknown): EaCAIDetails {
  return EaCAIDetailsSchema.parse(details);
}
