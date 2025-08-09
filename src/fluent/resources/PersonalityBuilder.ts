import { EaCPersonalityDetails } from "../../eac/EaCPersonalityDetails.ts";
import { EaCDetails } from "../../src.deps.ts";
import { Brand, ResourceBuilder } from "./ResourceBuilder.ts";

export type PersonalityId = Brand<string, "Personality">;

export class PersonalityBuilder<
  TDetails extends EaCPersonalityDetails = EaCPersonalityDetails,
> extends ResourceBuilder<TDetails, EaCDetails<TDetails>, "Personality"> {
  constructor(lookup: string, details: TDetails) {
    super(lookup, details);
  }

  Build(): Record<string, EaCDetails<TDetails>> {
    return this.BuildAs();
  }
}
