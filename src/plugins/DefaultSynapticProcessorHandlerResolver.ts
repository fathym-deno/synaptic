import { isEaCSynapticCircuitsProcessor } from "../eac/EaCSynapticCircuitsProcessor.ts";
import {
  EaCApplicationProcessorConfig,
  EaCRuntimeEaC,
  EaCRuntimeHandler,
  IoCContainer,
  ProcessorHandlerResolver,
} from "../src.deps.ts";

export class DefaultSynapticProcessorHandlerResolver
  implements ProcessorHandlerResolver {
  public async Resolve(
    ioc: IoCContainer,
    appProcCfg: EaCApplicationProcessorConfig,
    eac: EaCRuntimeEaC,
  ): Promise<EaCRuntimeHandler | undefined> {
    let toResolveName = "";

    if (isEaCSynapticCircuitsProcessor(appProcCfg.Application.Processor)) {
      toResolveName = "EaCSynapticCircuitsProcessor";
    }

    if (toResolveName) {
      const resolver = await ioc.Resolve<ProcessorHandlerResolver>(
        ioc.Symbol("ProcessorHandlerResolver"),
        toResolveName,
      );

      return await resolver.Resolve(ioc, appProcCfg, eac);
    } else {
      return undefined;
    }
  }
}
