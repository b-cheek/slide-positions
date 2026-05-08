import { NOTE_NAME_REGEX, SCI_NOTATION_REGEX } from "../processing/types/note";
import { TUNING_REGEX } from "../processing/types/tuning";

// Regexes

// Ranges do not allow adjustments
export const SCI_NOTATION_RANGE_REGEX = new RegExp(
  `${NOTE_NAME_REGEX.source}-${NOTE_NAME_REGEX.source}`,
);

const SCI_NOTATION_OR_RANGE_REGEX = new RegExp(
  `(?:${SCI_NOTATION_REGEX.source}|${SCI_NOTATION_RANGE_REGEX.source})`,
);

export const SCI_NOTATION_LIST_REGEX = new RegExp(
  // Allowing any number of spaces or commas in delimiter to be safe
  String.raw`^(?:${SCI_NOTATION_OR_RANGE_REGEX.source})(?:[\s,]+${SCI_NOTATION_OR_RANGE_REGEX.source})*$`,
);

export const TUNING_LIST_REGEX = new RegExp(
  String.raw`^(?:${TUNING_REGEX.source})(?:/+(?:${TUNING_REGEX.source}))*$`,
);

export const SINGLE_NOTE_REGEX = new RegExp(`^${SCI_NOTATION_REGEX.source}$`);
