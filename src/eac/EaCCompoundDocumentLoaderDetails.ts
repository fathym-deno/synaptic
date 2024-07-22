import {
  EaCDocumentLoaderDetails,
  isEaCDocumentLoaderDetails,
} from './EaCDocumentLoaderDetails.ts';

export type EaCCompoundDocumentLoaderDetails = {
  LoaderLookups: string[];
} & EaCDocumentLoaderDetails<'CompoundDocument'>;

export function isEaCCompoundDocumentLoaderDetails(
  details: unknown
): details is EaCCompoundDocumentLoaderDetails {
  const x = details as EaCCompoundDocumentLoaderDetails;

  return (
    isEaCDocumentLoaderDetails('CompoundDocument', x) &&
    x.LoaderLookups !== undefined &&
    Array.isArray(x.LoaderLookups) &&
    !!x.LoaderLookups?.length
  );
}
