import { PersonalityKey } from './PersonalityKey.ts';
import { Personality } from './Personality.ts';

export interface IPersonalityProvider {
  Provide(lookup: PersonalityKey): Promise<Personality>;
}
