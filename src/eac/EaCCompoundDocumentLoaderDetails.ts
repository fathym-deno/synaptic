import {
  EaCDocumentLoaderDetails,
  isEaCDocumentLoaderDetails,
} from './EaCDocumentLoaderDetails.ts';

export type EaCCompoundDocumentLoaderDetails = {
  LoaderLookups: string[];
} & EaCDocumentLoaderDetails<'CheerioWeb'>;

export function isEaCCompoundDocumentLoaderDetails(
  details: unknown
): details is EaCCompoundDocumentLoaderDetails {
  const x = details as EaCCompoundDocumentLoaderDetails;

  return (
    isEaCDocumentLoaderDetails('CheerioWeb', x) &&
    x.LoaderLookups !== undefined &&
    Array.isArray(x.LoaderLookups) &&
    !!x.LoaderLookups?.length
  );
}
