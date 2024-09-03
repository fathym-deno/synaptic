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

export type EaCGraphCircuitDetails = {
  Edges: Record<string, EaCGraphCircuitEdgeLike>;

  Interrupts?: {
    After?: string[];

    Before?: string[];
  };

  PersistenceLookup?: string;

  State?: ExtractStateDefinition<AnnotationRoot<any>> &
    EaCFluentTag<'FluentMethods', 'Property'>;
} & EaCCircuitDetails<'Graph'>;

type ExtractStateDefinition<T> = T extends AnnotationRoot<infer SD>
  ? SD
  : never;
type x = AnnotationRoot<any> & EaCFluentTag<'FluentMethods', 'Property'>;

export function isEaCGraphCircuitDetails(
  details: unknown
): details is EaCGraphCircuitDetails {
  const x = details as EaCGraphCircuitDetails;

  return isEaCCircuitDetails('Graph', x) && x.Edges !== undefined;
}
