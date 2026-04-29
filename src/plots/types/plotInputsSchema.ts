import { z } from "zod";
import type { RawPlotInputs, ParsedPlotInputs } from "./plotInputs";
import { Note } from "../processing/types/note";
import { Tuning } from "../processing/types/tuning";
import { examplePlotInputDefaults } from "../presets/examplePlotInputs";

export const plotInputsRawSchema = z.object({
  notesString: z.string().nonempty("Notes are required."),
  valvesString: z.string().default(examplePlotInputDefaults.valvesString),
  topSlideNote: z.string().default(examplePlotInputDefaults.topSlideNote),
  bottomSlideNote: z.string().default(examplePlotInputDefaults.bottomSlideNote),
  lipBendStartNote: z
    .string()
    .default(examplePlotInputDefaults.lipBendStartNote),
  lipBendStopNote: z.string().default(examplePlotInputDefaults.lipBendStopNote),
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
