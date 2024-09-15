import {
  // $FluentTag,
  configureEaCIoC,
  eacFluentBuilder,
  EaCRuntimePlugin,
  EverythingAsCodeSynaptic,
  EverythingAsCodeTags,
  FathymDFSFileHandlerPlugin,
  FathymEaCServicesPlugin,
  FathymSynapticPlugin,
  FluentBuilder,
  FluentBuilderMethodsHandlers,
  FluentBuilderRoot,
  IoCContainer,
  SelectFluentMethods,
} from "./.deps.ts";
import { EverythingAsCodeSynapticTags } from "./EverythingAsCodeSynapticTags.ts";

type BuilderType<TEaC> =
  & FluentBuilder<TEaC>
  & SelectFluentMethods<
    FluentBuilderRoot<EverythingAsCodeSynapticTags<EverythingAsCodeTags<TEaC>>>,
    TEaC
  >;

export function synapticFluentBuilder<TEaC extends EverythingAsCodeSynaptic>(
  model?: TEaC,
  handlers?: FluentBuilderMethodsHandlers,
): BuilderType<TEaC> {
  handlers = {
    ...(handlers || {}),
    Compile: (async (
      thisArg?: BuilderType<TEaC>,
      ioc?: IoCContainer,
      plugins?: EaCRuntimePlugin[],
    ): Promise<IoCContainer> => {
      const circsIoC = new IoCContainer();

      if (ioc) {
        ioc.CopyTo(circsIoC);
      }

      if (!plugins) {
        plugins = [];
      }

      plugins.push(new FathymDFSFileHandlerPlugin());

      plugins.push(new FathymEaCServicesPlugin());

      plugins.push(new FathymSynapticPlugin());

      await configureEaCIoC(circsIoC, thisArg!.Export(), plugins);

      return circsIoC;
    }),
  };

  return eacFluentBuilder<TEaC>(
    model,
    handlers,
    // TODO(mcgear): Why is this throwing errors on versions?
  ) as unknown as BuilderType<TEaC>;
}
