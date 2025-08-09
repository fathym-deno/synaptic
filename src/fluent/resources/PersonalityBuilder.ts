import { EaCPersonalityAsCode } from "../../eac/EaCPersonalityAsCode.ts";
import { EaCPersonalityDetails } from "../../eac/EaCPersonalityDetails.ts";
import { Brand, ResourceBuilder } from "./ResourceBuilder.ts";

export type PersonalityId = Brand<string, "Personality">;

export class PersonalityBuilder<
  TDetails extends EaCPersonalityDetails = EaCPersonalityDetails,
> extends ResourceBuilder<TDetails, EaCPersonalityAsCode, "Personality"> {
  constructor(lookup: string, details: TDetails) {
    super(lookup, details);
  }

  Build(): Record<string, EaCPersonalityAsCode> {
    return this.BuildAs();
  }
}
