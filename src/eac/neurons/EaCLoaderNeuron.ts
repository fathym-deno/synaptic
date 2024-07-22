import { EaCNeuron, isEaCNeuron } from '../EaCNeuron.ts';

export type EaCLoaderNeuron = {
  LoaderLookup: string;
} & EaCNeuron<'Loader'>;

export function isEaCLoaderNeuron(
  details: unknown
): details is EaCLoaderNeuron {
  const x = details as EaCLoaderNeuron;

  return (
    isEaCNeuron('Loader', x) &&
    x.LoaderLookup !== undefined &&
    typeof x.LoaderLookup === 'string'
  );
}
