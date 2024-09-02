import { jsonMapSetClone } from '../src.deps.ts';
import {
  configureEaCIoC,
  EaCRuntimePlugin,
  EverythingAsCode,
  FathymDFSFileHandlerPlugin,
  FathymEaCServicesPlugin,
  FathymSynapticPlugin,
  IoCContainer,
  ValueType,
} from './.deps.ts';
import { SelectEaCFluentMethods } from './types/SelectEaCFluentMethods.ts';

export function eacFluentBuilder<
  TEaC extends EverythingAsCode = EverythingAsCode
>(eac?: TEaC): EaCFluentBuilder<TEaC> & SelectEaCFluentMethods<TEaC, TEaC> {
  return new EaCFluentBuilder<TEaC>([], eac) as EaCFluentBuilder<TEaC> &
    SelectEaCFluentMethods<TEaC, TEaC>;
}

export class EaCFluentBuilder<TEaC extends EverythingAsCode> {
  protected eac: TEaC;

  protected keyDepth: string[];

  constructor(keyDepth?: string[], eac?: TEaC) {
    this.eac = eac || ({} as TEaC);

    this.keyDepth = keyDepth || [];

    return this.createProxy();
  }

  public async Compile(
    ioc?: IoCContainer,
    plugins?: EaCRuntimePlugin[]
  ): Promise<IoCContainer> {
    const circsIoC = new IoCContainer();

    if (ioc) {
      ioc.CopyTo(circsIoC);
    }

    if (!plugins) {
      plugins = [];
    }

    plugins.push(new FathymSynapticPlugin());

    plugins.push(new FathymDFSFileHandlerPlugin());

    plugins.push(new FathymEaCServicesPlugin());

    await configureEaCIoC(circsIoC, this.Export(), plugins);

    return circsIoC;
  }

  public Export(): TEaC {
    const newEaC = jsonMapSetClone(this.eac) as Record<string, unknown>;

    let eacWorking = newEaC as Record<string, unknown>;

    this.keyDepth.forEach((nextKey, i) => {
      // if (i < this.keyDepth.length - 1) {
      const workingProps = Object.keys(eacWorking ?? {});

      workingProps.forEach((key) => {
        if (key !== nextKey) {
          // deno-lint-ignore no-explicit-any
          delete (eacWorking as any)[key];
        }
      });

      eacWorking = eacWorking[nextKey] as Record<string, unknown>;
      // }
    });

    return newEaC as TEaC;
  }

  public With(
    action: (x: this) => void
  ): this &
    SelectEaCFluentMethods<
      ValueType<ReturnType<typeof this.workingRecords>>,
      TEaC
    > {
    action(this);

    return this as this &
      SelectEaCFluentMethods<
        ValueType<ReturnType<typeof this.workingRecords>>,
        TEaC
      >;
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
              typeof target.workingRecords() === 'object' &&
              'Details' in target.workingRecords() &&
              typeof target.workingRecords().Details !== 'undefined'
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
            target.eac
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
