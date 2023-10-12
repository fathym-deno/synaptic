import { FunctionDefinition } from "npm:@azure/openai@next";

export type FunctionConfig = {
  Definition: FunctionDefinition;

  Module: unknown;
};
