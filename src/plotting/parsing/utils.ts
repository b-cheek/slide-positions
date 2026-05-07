import { z } from "zod";
import { getNotesInRange } from "../processing/utils/music";
import { NOTE_NAME_REGEX, SCI_NOTATION_REGEX } from "../processing/types/note";
import { TUNING_REGEX } from "../processing/types/tuning";
import { Note } from "../processing/types/note";
import type { RawPlotInputs } from "../types/plotInputs";

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

export const optionalStringWithDefault = (
  regex: RegExp,
  message: string,
  defaultValue: string,
) =>
  z.preprocess(
    coerceToUndefined,
    z.string().regex(regex, { message }).default(defaultValue),
  );

export const coerceToUndefined = (value: unknown) => {
  // I think reading from the URL params and the initial form load results in undefined values
  // even if this isn't completely necessary, it is helpful
  // TODO: I still have reservations about this...
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
};

export const sciNotationRangeTransform = (value: string) => {
  const [start, stop] = value.split("-").map((s) => s.trim());
  const startNote = Note.fromSciNotation(start);
  const stopNote = Note.fromSciNotation(stop);
  const middleNotes = getNotesInRange(startNote, stopNote);
  return [startNote, ...middleNotes, stopNote];
};

const PLOT_INPUT_QUERY_KEYS = [
  "notesString",
  "valvesString",
  "topSlideNote",
  "bottomSlideNote",
  "lipBendStartNote",
  "lipBendStopNote",
  "title",
]; // TODO: I hate that I have to have this...

export function readPlotInputRawValues(searchParams: URLSearchParams) {
  return Object.fromEntries(
    PLOT_INPUT_QUERY_KEYS.map((key) => [
      key,
      coerceToUndefined(searchParams.get(key)), // Perhaps better way to extract params with names?
    ]).filter(([, value]) => value !== undefined),
  );
}
