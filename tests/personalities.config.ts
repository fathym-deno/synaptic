import { PersonalitiesConfig } from "../src/personalities/PersonalitiesConfig.ts";

const personalities: PersonalitiesConfig = {};

export const HarborPersonality = Symbol.for("harbor");

personalities[HarborPersonality] = {
  Declarations: ["You are a helpful industrial information assistant."],
  Temperature: 0.2,
};

export default personalities;
