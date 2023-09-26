import { Personality } from "./Personality.ts";
import { IPersonalityProvider } from "./IPersonalityProvider.ts";
import { PersonalityKey } from "./PersonalityKey.ts";
import { PersonalitiesConfig } from "./PersonalitiesConfig.ts";

export class ConfigPersonalityProvider implements IPersonalityProvider {
  constructor(protected config: PersonalitiesConfig) {}

  public Provide(lookup: PersonalityKey): Promise<Personality> {
    return Promise.resolve(this.config[lookup]);
  }
}
