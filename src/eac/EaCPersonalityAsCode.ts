// EaCPersonalityAsCode.ts
import { EaCDetails, EaCDetailsSchema, z } from "../src.deps.ts";
import {
  EaCPersonalityDetails,
  EaCPersonalityDetailsSchema,
} from "./EaCPersonalityDetails.ts";

export type EaCPersonalityAsCode = {
  /** Optional aliases for this personality (e.g., "Semantic", "Base"). */
  PersonalityLookups?: string[];
} & EaCDetails<EaCPersonalityDetails>;

export const EaCPersonalityAsCodeSchema: z.ZodType<EaCPersonalityAsCode> =
  EaCDetailsSchema.extend({
    Details: EaCPersonalityDetailsSchema,
    PersonalityLookups: z
      .array(z.string().min(1))
      .optional()
      .describe("Ordered base personality keys resolved before Details."),
  }).describe(
    "Reusable prompt contract controlling voice/behavior at generation time. " +
      "Composition: PersonalityLookups are merged left→right, then Details is merged last; arrays concatenate and primitives overwrite. " +
      "Used by ChatPrompt neurons; deterministic given the same inputs.",
  );

export function isEaCPersonalityAsCode(
  eac: unknown,
): eac is EaCPersonalityAsCode {
  return EaCPersonalityAsCodeSchema.safeParse(eac).success;
}
