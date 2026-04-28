import { z } from "zod";
import type { RawPlotInputs, ParsedPlotInputs } from "./plotInputs";
import { Note } from "../processing/types/note";
import { Tuning } from "../processing/types/tuning";
import { freqToLength } from "../processing/utils/physics";

export const plotInputsRawSchema = z.object({
  notesString: z.string().nonempty("Notes are required."),
  valvesString: z.string().default("Bb/F"),
  topSlideNote: z.string().default("Bb1"),
  bottomSlideNote: z.string().default("E1"),
  lipBendStartNote: z.string().default("Bb1"),
  lipBendStopNote: z.string().default("F1"),
});

export const plotInputsSchema = plotInputsRawSchema.transform(
  (raw: RawPlotInputs): ParsedPlotInputs => {
    // Apply sensible defaults for optional fields before parsing
    const notesString = (raw.notesString || "").trim();
    const valvesString = (raw.valvesString || "").trim() || "Bb/F";
    const topSlide = (raw.topSlideNote || "Bb1").trim();
    const bottomSlide = (raw.bottomSlideNote || "E1").trim();
    const lipStartStr = (raw.lipBendStartNote || "Bb1").trim();
    const lipStopStr = (raw.lipBendStopNote || "F1").trim();

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
