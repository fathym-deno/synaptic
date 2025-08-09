import { EaCPersistenceAsCode } from "../../eac/EaCPersistenceAsCode.ts";
import { EaCPersistenceDetails } from "../../eac/EaCPersistenceDetails.ts";
import { Brand, ResourceBuilder } from "./ResourceBuilder.ts";

export type PersistenceId = Brand<string, "Persistence">;

export class PersistenceBuilder<
  TDetails extends EaCPersistenceDetails = EaCPersistenceDetails,
> extends ResourceBuilder<TDetails, EaCPersistenceAsCode, "Persistence"> {
  constructor(lookup: string, details: TDetails) {
    super(lookup, details);
  }

  Build(): Record<string, EaCPersistenceAsCode> {
    return this.BuildAs();
  }
}
