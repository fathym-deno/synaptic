import { EaCCircuitAsCode } from "../../eac/EaCCircuitAsCode.ts";
import { EaCGraphCircuitDetails } from "../../eac/EaCGraphCircuitDetails.ts";
import { EaCLinearCircuitDetails } from "../../eac/EaCLinearCircuitDetails.ts";
import { GraphCircuitBuilder } from "./GraphCircuitBuilder.ts";
import { LinearCircuitBuilder } from "./LinearCircuitBuilder.ts";

export class CircuitsWorkspace {
  protected readonly scope: string;

  protected readonly circuits: Record<string, EaCCircuitAsCode> = {};

  constructor(scope: string) {
    this.scope = scope;
  }

  public Graph(
    lookup: string,
    build: (g: GraphCircuitBuilder) => GraphCircuitBuilder | void,
  ): this {
    const g = new GraphCircuitBuilder();
    build(g);
    const details = g.Build() as EaCGraphCircuitDetails;
    this.circuits[lookup] = { Details: details } as EaCCircuitAsCode;
    return this;
  }

  public Linear(
    lookup: string,
    build: (l: LinearCircuitBuilder) => LinearCircuitBuilder | void,
  ): this {
    const l = new LinearCircuitBuilder();
    build(l);
    const details = l.Build() as EaCLinearCircuitDetails;
    this.circuits[lookup] = { Details: details } as EaCCircuitAsCode;
    return this;
  }

  public Build(): Record<string, EaCCircuitAsCode> {
    return this.circuits;
  }
}
