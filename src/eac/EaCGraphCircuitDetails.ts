import { EaCFluentTag } from "../fluent/types/SelectEaCFluentMethods.ts";
import { RunnableConfig, StateDefinition } from '../src.deps.ts';
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
  Edges:
    & Record<string, EaCGraphCircuitEdgeLike>
    & EaCFluentTag<"FluentMethods", "Record">;

  Interrupts?: {
    After?: string[];

    Before?: string[];
  };

  PersistenceLookup?: string;

  State?: StateDefinition & EaCFluentTag<"FluentMethods", "Property">;
} & EaCCircuitDetails<"Graph">;

export function isEaCGraphCircuitDetails(
  details: unknown,
): details is EaCGraphCircuitDetails {
  const x = details as EaCGraphCircuitDetails;

  return isEaCCircuitDetails("Graph", x) && x.Edges !== undefined;
}
