import { EaCDetails, EaCVertexDetails } from "../../src.deps.ts";

export type Brand<T, B extends string> = T & { __brand: B };

export abstract class ResourceBuilder<
  TDetails extends EaCVertexDetails,
  TAsCode extends EaCDetails<TDetails>,
  TBrand extends string,
> {
  public readonly id: Brand<string, TBrand>;

  protected constructor(
    protected readonly lookup: string,
    protected readonly details: TDetails,
  ) {
    this.id = lookup as Brand<string, TBrand>;
  }

  protected BuildAs(): Record<string, TAsCode> {
    return { [this.lookup]: { Details: this.details } as TAsCode };
  }
}
