import { EaCDetails } from "../../src.deps.ts";
import {
  EaCChatHistoryDetails,
  isEaCChatHistoryDetails,
} from "../history/EaCChatHistoryDetails.ts";

export type EaCChatHistoryAsCode = EaCDetails<EaCChatHistoryDetails>;

export function isEaCChatHistoryAsCode(
  eac: unknown,
): eac is EaCChatHistoryAsCode {
  const x = eac as EaCChatHistoryAsCode;

  return x && isEaCChatHistoryDetails(undefined, x.Details);
}
