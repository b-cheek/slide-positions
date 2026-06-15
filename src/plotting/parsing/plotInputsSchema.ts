import { z } from "zod";
import { Note } from "../processing/types/note";
import { Tuning } from "../processing/types/tuning";
import {
  SCI_NOTATION_LIST_REGEX,
  SCI_NOTATION_RANGE_REGEX,
  TUNING_LIST_REGEX,
  SINGLE_NOTE_REGEX,
} from "./regex";
import { optionalStringWithDefault, sciNotationRangeTransform } from "./utils";

// TODO different error messages with examples
export const plotInputsRawSchema = z.object({
  notesString: z.string().regex(SCI_NOTATION_LIST_REGEX, {
    message: "Invalid note string format",
  }),
  valvesString: optionalStringWithDefault(
    TUNING_LIST_REGEX,
    "Invalid valves string format",
    "Bb/F",
  ),
  // TODO: add handling to adjust tunings to account for first pos distance
  topSlideNote: optionalStringWithDefault(
    SINGLE_NOTE_REGEX,
    "Invalid top slide note format",
    "Bb1",
  ),
  bottomSlideNote: optionalStringWithDefault(
    SINGLE_NOTE_REGEX,
    "Invalid bottom slide note format",
    "E1",
  ),
  // TODO: enforce that if you have one, you must have both
  lipBendStartNote: optionalStringWithDefault(
    SINGLE_NOTE_REGEX,
    "Invalid lip bend start note format",
    "Bb1",
  ),
  lipBendStopNote: optionalStringWithDefault(
    SINGLE_NOTE_REGEX,
    "Invalid lip bend stop note format",
    "G1",
  ),
  title: z.string().optional(),
});

export type RawPlotInputs = z.infer<typeof plotInputsRawSchema>;
export type OptionalPlotInputs = Omit<RawPlotInputs, "notesString">;

export const plotInputsSchema = plotInputsRawSchema.transform((raw) => {
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

  const title =
    raw.title?.trim() ||
    tunings.map((t) => t.name.split(" ")[0]).join("/") +
      " Trombone Slide Positions";

  return {
    notes,
    tunings,
    topSlideNote: top,
    bottomSlideNote: bottom,
    lipBendStartNote: lipStart,
    lipBendStopNote: lipStop,
    title,
  };
});

export type ParsedPlotInputs = z.infer<typeof plotInputsSchema>;
