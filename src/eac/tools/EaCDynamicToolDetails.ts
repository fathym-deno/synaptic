// deno-lint-ignore-file no-explicit-any
import {
  CallbackManagerForToolRun,
  RunnableConfig,
  z,
} from '../../src.deps.ts';
import { EaCToolDetails, isEaCToolDetails } from '../EaCToolDetails.ts';

export type EaCDynamicToolDetails<T extends z.ZodType<any> = z.ZodType<any>> = {
  Action: (
    input: z.infer<T>,
    runManager?: CallbackManagerForToolRun,
    config?: RunnableConfig
  ) => Promise<string>;

  Description: string;

  Name: string;

  Schema: T;
} & EaCToolDetails<'Dynamic'>;

export function isEaCDynamicToolDetails(
  details: unknown
): details is EaCDynamicToolDetails {
  const x = details as EaCDynamicToolDetails;

  return (
    isEaCToolDetails('Dynamic', x) &&
    x.Description !== undefined &&
    typeof x.Description === 'string' &&
    x.Name !== undefined &&
    typeof x.Name === 'string'
  );
}
