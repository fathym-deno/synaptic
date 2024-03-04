import { FunctionDefinition } from "npm:@azure/openai@1.0.0-beta.7";

export type FunctionConfig = {
  Definition: FunctionDefinition;

  Module: unknown;
};
