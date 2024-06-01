import {
  EaCTextSplitterDetails,
  isEaCTextSplitterDetails,
} from "./EaCTextSplitterDetails.ts";

export type EaCRecursiveCharacterTextSplitterDetails = {
  ChunkOverlap?: number;

  ChunkSize?: number;

  Separators?: string[];
} & EaCTextSplitterDetails<"RecursiveCharacter">;

export function isEaCRecursiveCharacterTextSplitterDetails(
  details: unknown,
): details is EaCRecursiveCharacterTextSplitterDetails {
  const vsDetails = details as EaCRecursiveCharacterTextSplitterDetails;

  return isEaCTextSplitterDetails("RecursiveCharacter", vsDetails);
}
