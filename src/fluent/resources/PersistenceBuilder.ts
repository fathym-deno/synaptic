import { EaCPersistenceDetails } from "../../eac/EaCPersistenceDetails.ts";
import { EaCDetails } from "../../src.deps.ts";
import { Brand, ResourceBuilder } from "./ResourceBuilder.ts";

export type PersistenceId = Brand<string, "Persistence">;

export class PersistenceBuilder<
  TDetails extends EaCPersistenceDetails = EaCPersistenceDetails,
> extends ResourceBuilder<TDetails, EaCDetails<TDetails>, "Persistence"> {
  constructor(lookup: string, details: TDetails) {
    super(lookup, details);
  }

  Build(): Record<string, EaCDetails<TDetails>> {
    return this.BuildAs();
  }
}
