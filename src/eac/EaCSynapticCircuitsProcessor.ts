import { EaCProcessor, isEaCProcessor } from "../src.deps.ts";

export type EaCSynapticCircuitsProcessor = {
  IsCodeDriven?: boolean;

  Excludes?: string[];

  Includes?: string[];
} & EaCProcessor<"SynapticCircuits">;

export function isEaCSynapticCircuitsProcessor(
  proc: unknown,
): proc is EaCSynapticCircuitsProcessor {
  const x = proc as EaCSynapticCircuitsProcessor;

  return isEaCProcessor("SynapticCircuits", x);
}
