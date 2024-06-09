import { RunnableConfig, StateGraphArgs } from "../src.deps.ts";
import { EaCCircuitDetails, isEaCCircuitDetails } from "./EaCCircuitDetails.ts";

export type EaCGraphCircuitEdge = {
  Condition?: (
    state: unknown,
    cfg: RunnableConfig | undefined,
  ) => string | string[] | Promise<string> | Promise<string[]>;

  Node?: string | Record<string, string>;
};

export type EaCGraphCircuitEdgeLike =
  | string
  | EaCGraphCircuitEdge
  | (string | EaCGraphCircuitEdge)[];

export type EaCGraphCircuitDetails = {
  Edges: Record<string, EaCGraphCircuitEdgeLike>;

  State?: Partial<StateGraphArgs<unknown>["channels"]>;
} & EaCCircuitDetails<"Graph">;

export function isEaCGraphCircuitDetails(
  details: unknown,
): details is EaCGraphCircuitDetails {
  const x = details as EaCGraphCircuitDetails;

  return isEaCCircuitDetails("Graph", x) && x.Edges !== undefined;
}
