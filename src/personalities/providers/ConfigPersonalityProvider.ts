import { Personality } from '../Personality.ts';
import { IPersonalityProvider } from '../IPersonalityProvider.ts';
import { PersonalityKey } from '../PersonalityKey.ts';
import { PersonalitiesConfig } from '../PersonalitiesConfig.ts';

export class ConfigPersonalityProvider implements IPersonalityProvider {
  constructor(protected config: PersonalitiesConfig) {}

  public async Provide(lookup: PersonalityKey): Promise<Personality> {
    return this.config[lookup];
  }
}
