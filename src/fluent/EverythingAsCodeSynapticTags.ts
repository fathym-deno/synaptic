import { $FluentTag, EaCRuntimePlugin, IoCContainer, IsObjectNotNative } from './.deps.ts';

export type EverythingAsCodeSynapticTags<T> = true extends IsObjectNotNative<T>
  ? SynapticObjectTags<T>
  : T;

type SynapticObjectTags<T> = T & SynapticStandardTags<T>;

// Improved handling of recursive tag types and union types
type SynapticStandardTags<T> = {
  [K in keyof T]: EverythingAsCodeSynapticTags<T>;
} & $FluentTag<
  'Methods',
  never,
  'handlers',
  {
    handlers: {
      Compile: (ioc?: IoCContainer, plugins?: EaCRuntimePlugin[]) => IoCContainer;
    };
  }
>;

