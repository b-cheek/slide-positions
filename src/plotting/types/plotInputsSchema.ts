import { z } from "zod";
import type { RawPlotInputs, ParsedPlotInputs } from "./plotInputs";
import { Note } from "../processing/types/note";
import { Tuning, TUNING_REGEX } from "../processing/types/tuning";
import { exampleInputs } from "../presets/examplePlotInputs";
import { NOTE_NAME_REGEX, SCI_NOTATION_REGEX } from "../processing/types/note";
import { getNotesInRange } from "../processing/utils/music";

// Ranges do not allow adjustments
const SCI_NOTATION_RANGE_REGEX = new RegExp(
  `${NOTE_NAME_REGEX.source}-${NOTE_NAME_REGEX.source}`,
);

const SCI_NOTATION_OR_RANGE_REGEX = new RegExp(
  `(?:${SCI_NOTATION_REGEX.source}|${SCI_NOTATION_RANGE_REGEX.source})`,
);

const SCI_NOTATION_LIST_REGEX = new RegExp(
  // Allowing any number of spaces or commas in delimiter to be safe
  String.raw`^(?:${SCI_NOTATION_OR_RANGE_REGEX.source})(?:[\s,]+${SCI_NOTATION_OR_RANGE_REGEX.source})*$`,
);

const TUNING_LIST_REGEX = new RegExp(
  String.raw`^(?:${TUNING_REGEX.source})(?:/+(?:${TUNING_REGEX.source}))*$`,
);

const SINGLE_NOTE_REGEX = new RegExp(`^${SCI_NOTATION_REGEX.source}$`);

// coerce empty strings to undefined so that zod can apply defaults for optional fields
const blankStringToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const optionalStringWithDefault = (
  regex: RegExp,
  message: string,
  defaultValue: string,
) =>
  z.preprocess(
    blankStringToUndefined,
    z.string().regex(regex, { message }).default(defaultValue),
  );

// TODO different error messages with examples
export const plotInputsRawSchema = z.object({
  notesString: z.string().regex(SCI_NOTATION_LIST_REGEX, {
    message: "Invalid note string format",
  }),
  valvesString: optionalStringWithDefault(
    TUNING_LIST_REGEX,
    "Invalid valves string format",
    exampleInputs.valvesString,
  ),
  topSlideNote: optionalStringWithDefault(
    SINGLE_NOTE_REGEX,
    "Invalid top slide note format",
    exampleInputs.topSlideNote,
  ),
  bottomSlideNote: optionalStringWithDefault(
    SINGLE_NOTE_REGEX,
    "Invalid bottom slide note format",
    exampleInputs.bottomSlideNote,
  ),
  lipBendStartNote: optionalStringWithDefault(
    SINGLE_NOTE_REGEX,
    "Invalid lip bend start note format",
    exampleInputs.lipBendStartNote,
  ),
  lipBendStopNote: optionalStringWithDefault(
    SINGLE_NOTE_REGEX,
    "Invalid lip bend stop note format",
    exampleInputs.lipBendStopNote,
  ),
});

// TODO dedicated parsers file
const sciNotationRangeTransform = (value: string) => {
  const [start, stop] = value.split("-").map((s) => s.trim());
  const startNote = Note.fromSciNotation(start);
  const stopNote = Note.fromSciNotation(stop);
  const middleNotes = getNotesInRange(startNote, stopNote);
  return [startNote, ...middleNotes, stopNote];
};

export const plotInputsSchema = plotInputsRawSchema.transform(
  (raw: RawPlotInputs): ParsedPlotInputs => {
    // Apply sensible defaults for optional fields before parsing
    const noteTokens = raw.notesString
      .replace(/,/g, " ")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    const notes = noteTokens.flatMap((token) =>
      SCI_NOTATION_RANGE_REGEX.test(token)
        ? sciNotationRangeTransform(token)
        : Note.fromSciNotation(token.trim()),
    );

    const tuningTokens = raw.valvesString
      .replace(/,/g, " ")
      .trim()
      .split(/[\s\/]+/)
      .filter(Boolean);
    const tunings = tuningTokens.map((s) =>
      Tuning.fromPitchClassOrPitch(s.trim()),
    );

    const top = Note.fromSciNotation(raw.topSlideNote);
    const bottom = Note.fromSciNotation(raw.bottomSlideNote);
    const lipStart = Note.fromSciNotation(raw.lipBendStartNote);
    const lipStop = Note.fromSciNotation(raw.lipBendStopNote);

    return {
      notes,
      tunings,
      topSlideNote: top,
      bottomSlideNote: bottom,
      lipBendStartNote: lipStart,
      lipBendStopNote: lipStop,
    };
  },
);
