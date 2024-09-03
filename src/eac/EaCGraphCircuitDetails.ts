import { EaCFluentTag } from '../fluent/types/SelectEaCFluentMethods.ts';
import {
  AnnotationRoot,
  RunnableConfig,
  StateDefinition,
} from '../src.deps.ts';
import { EaCCircuitDetails, isEaCCircuitDetails } from './EaCCircuitDetails.ts';

export type EaCGraphCircuitEdge = {
  Condition?: (
    state: unknown,
    cfg: RunnableConfig | undefined
  ) => string | string[] | Promise<string> | Promise<string[]>;

  Node?: string | Record<string, string>;
};

export type EaCGraphCircuitEdgeLike =
  | string
  | EaCGraphCircuitEdge
  | (string | EaCGraphCircuitEdge)[];

export type EaCGraphCircuitDetails<TState extends StateDefinition> = {
  Edges: Record<string, EaCGraphCircuitEdgeLike>;

  Interrupts?: {
    After?: string[];

    Before?: string[];
  };

  PersistenceLookup?: string;

  // State?: Partial<StateGraphArgs<unknown>["channels"]>;
  State?: AnnotationRoot<TState> & EaCFluentTag<'FluentMethods', 'AsCode'>;
} & EaCCircuitDetails<'Graph'>;

export function isEaCGraphCircuitDetails<TState extends StateDefinition>(
  details: unknown
): details is EaCGraphCircuitDetails<TState> {
  const x = details as EaCGraphCircuitDetails<TState>;

  return isEaCCircuitDetails('Graph', x) && x.Edges !== undefined;
}
