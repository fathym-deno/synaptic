import { EverythingAsCode } from "./.deps.ts";
import { EaCFluentBuilder } from "./EaCFluentBuilder.ts";

export class EaCFluentBuilderProxy<TEaC extends EverythingAsCode> {
  protected eac: TEaC;

  protected keyDepth: string[];

  constructor(keyDepth?: string[], eac?: TEaC) {
    this.eac = eac || ({} as TEaC);

    this.keyDepth = keyDepth || [];

    return this.createProxy();
  }

  protected createProxy(): this {
    return new Proxy(this, {
      get(target, prop, receiver) {
        if (prop in target) {
          return Reflect.get(target, prop, receiver);
        }

        return (...args: unknown[]) => {
          const newKeys: string[] = [];

          let newValue: unknown;

          if (args?.length) {
            if (
              typeof target.workingRecords() === "object" &&
              "Details" in target.workingRecords() &&
              typeof target.workingRecords().Details !== "undefined"
            ) {
              const [lookup] = args as [string];

              newKeys.push(...[prop.toString(), lookup]);

              newValue = target.workingRecords()[prop.toString()] ?? {};

              if (!(lookup in (newValue as Record<string, unknown>))) {
                (newValue as Record<string, unknown>)[lookup] = {};
              }
            } else {
              const [value] = args;

              newValue = value;
            }
          } else {
            newKeys.push(prop.toString());

            newValue = target.workingRecords()[prop.toString()] ?? {};
          }

          target.workingRecords()[prop.toString()] = newValue;

          return new EaCFluentBuilder<TEaC>(
            [...target.keyDepth, ...newKeys],
            target.eac,
          );
        };
      },
    }) as this;
  }

  protected workingRecords(): Record<string, unknown> {
    return this.keyDepth.reduce((working, nextKey) => {
      working = working[nextKey] as Record<string, unknown>;

      return working;
    }, this.eac as Record<string, unknown>);
  }
}
