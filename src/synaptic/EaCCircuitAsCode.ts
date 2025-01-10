import { EaCDetails, EaCDetailsSchema, z } from './.deps.ts';
import {
  EaCCircuitDetails,
  EaCCircuitDetailsSchema,
  isEaCCircuitDetails,
} from './EaCCircuitDetails.ts';

/**
 * Represents a circuit configuration in the Everything as Code (EaC) framework.
 *
 * Combines circuit-specific details with optional nested circuits for composable configurations.
 */
export type EaCCircuitAsCode = {
  /** Optional nested circuits mapped by unique identifiers. */
  Circuits?: Record<string, EaCCircuitAsCode>;
} & EaCDetails<EaCCircuitDetails>;

/**
 * Schema for `EaCCircuitAsCode`.
 * Validates the structure, ensuring compatibility with circuit details and optional nested circuits.
 */
export const EaCCircuitAsCodeSchema: z.ZodObject<
  {
    Circuits: z.ZodOptional<
      z.ZodRecord<z.ZodString, z.ZodLazy<typeof EaCCircuitAsCodeSchema>>
    >;
    Details: z.ZodOptional<typeof EaCCircuitDetailsSchema>;
  },
  'strip',
  z.ZodTypeAny,
  EaCCircuitAsCode,
  EaCCircuitAsCode
> = EaCDetailsSchema.extend({
  Circuits: z
    .record(z.lazy(() => EaCCircuitAsCodeSchema))
    .optional()
    .describe('Optional nested circuits mapped by unique identifiers.'),
  Details: EaCCircuitDetailsSchema.optional(),
}).describe(
  'Schema for EaCCircuitAsCode, defining circuit-specific details and optional nested circuits for composable configurations.'
);

/**
 * Type guard for `EaCCircuitAsCode`.
 * Validates if the given object conforms to the `EaCCircuitAsCode` structure.
 *
 * @param eac - The object to validate.
 * @returns True if the object is a valid `EaCCircuitAsCode`, false otherwise.
 */
export function isEaCCircuitAsCode(eac: unknown): eac is EaCCircuitAsCode {
  const result = EaCCircuitAsCodeSchema.safeParse(eac);
  return result.success && isEaCCircuitDetails(undefined, result.data.Details);
}

/**
 * Validates and parses an object as `EaCCircuitAsCode`.
 *
 * @param eac - The object to validate and parse.
 * @throws If the object does not conform to the `EaCCircuitAsCodeSchema`.
 * @returns The parsed `EaCCircuitAsCode` object.
 */
export function parseEaCCircuitAsCode(eac: unknown): EaCCircuitAsCode {
  return EaCCircuitAsCodeSchema.parse(eac);
}
