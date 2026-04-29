import { z } from "zod";
import type { RawPlotInputs, ParsedPlotInputs } from "./plotInputs";
import { Note } from "../processing/types/note";
import { Tuning, TUNING_REGEX } from "../processing/types/tuning";
import { examplePlotInputDefaults } from "../presets/examplePlotInputs";
import { SCI_NOTATION_REGEX } from "../processing/types/note";

const SCI_NOTATION_LIST_REGEX = new RegExp(
  // Allowing any number of spaces or commas in delimiter to be safe
  String.raw`^(?:${SCI_NOTATION_REGEX.source})(?:[\s,]+${SCI_NOTATION_REGEX.source})*$`,
);

const TUNING_LIST_REGEX = new RegExp(
  String.raw`^(?:${TUNING_REGEX.source})(?:/+(?:${TUNING_REGEX.source}))*$`,
);

const SINGLE_NOTE_REGEX = new RegExp(`^${SCI_NOTATION_REGEX.source}$`);

// TODO different error messages with examples and an overall refactor for cleanliness
export const plotInputsRawSchema = z.object({
  notesString: z.string().regex(SCI_NOTATION_LIST_REGEX, {
    message: "Invalid note string format",
  }),
  valvesString: z
    .string()
    .regex(TUNING_LIST_REGEX, {
      message: "Invalid valves string format",
    })
    .default(examplePlotInputDefaults.valvesString),
  topSlideNote: z
    .string()
    .regex(SINGLE_NOTE_REGEX, {
      message: "Invalid top slide note format",
    })
    .default(examplePlotInputDefaults.topSlideNote),
  bottomSlideNote: z
    .string()
    .regex(SINGLE_NOTE_REGEX, {
      message: "Invalid bottom slide note format",
    })
    .default(examplePlotInputDefaults.bottomSlideNote),
  lipBendStartNote: z
    .string()
    .regex(SINGLE_NOTE_REGEX, {
      message: "Invalid lip bend start note format",
    })
    .default(examplePlotInputDefaults.lipBendStartNote),
  lipBendStopNote: z
    .string()
    .regex(SINGLE_NOTE_REGEX, {
      message: "Invalid lip bend stop note format",
    })
    .default(examplePlotInputDefaults.lipBendStopNote),
});

export const plotInputsSchema = plotInputsRawSchema.transform(
  (raw: RawPlotInputs): ParsedPlotInputs => {
    // Apply sensible defaults for optional fields before parsing
    const notesString = raw.notesString.trim();
    const valvesString = (
      raw.valvesString ?? examplePlotInputDefaults.valvesString
    ).trim();
    const topSlide = (
      raw.topSlideNote ?? examplePlotInputDefaults.topSlideNote
    ).trim();
    const bottomSlide = (
      raw.bottomSlideNote ?? examplePlotInputDefaults.bottomSlideNote
    ).trim();
    const lipStartStr = (
      raw.lipBendStartNote ?? examplePlotInputDefaults.lipBendStartNote
    ).trim();
    const lipStopStr = (
      raw.lipBendStopNote ?? examplePlotInputDefaults.lipBendStopNote
    ).trim();

    const noteTokens = notesString
      .replace(/,/g, " ")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    const notes = noteTokens.map((s) => Note.fromSciNotation(s.trim()));

    const tuningTokens = valvesString
      .replace(/,/g, " ")
      .trim()
      .split(/[\s\/]+/)
      .filter(Boolean);
    const tunings = tuningTokens.map((s) =>
      Tuning.fromPitchClassOrPitch(s.trim()),
    );

    const top = Note.fromSciNotation(topSlide);
    const bottom = Note.fromSciNotation(bottomSlide);
    const lipStart = Note.fromSciNotation(lipStartStr);
    const lipStop = Note.fromSciNotation(lipStopStr);

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

export type PlotInputsSchemaType = z.infer<typeof plotInputsRawSchema>;
