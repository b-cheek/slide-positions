import type { RawPlotInputs } from "../parsing/plotInputsSchema";
import { plotInputsRawSchema } from "../parsing/plotInputsSchema";

export const placeholderInputs: RawPlotInputs = plotInputsRawSchema.parse({
  notesString: "Bb1 C2 D2",
} satisfies Partial<RawPlotInputs>);

export const exampleInputs: RawPlotInputs[] = [
  plotInputsRawSchema.parse({
    notesString: "Bb2-Bb4(Bb)",
    title: "Bb/F Tenor Trombone 2 Octaves in Bb",
  } satisfies Partial<RawPlotInputs>),
  plotInputsRawSchema.parse({
    notesString: "Bb1-Bb3(Bb)",
    valvesString: "Bb/F/Gb/D",
    title: "Bb/F/Gb/D Bass Trombone 2 Octaves in Bb",
  } satisfies Partial<RawPlotInputs>),
  plotInputsRawSchema.parse({
    notesString: "Eb3-Eb5",
    valvesString: "Eb2",
    topSlideNote: "Eb2+5",
    bottomSlideNote: "A1-10",
    title: "Eb Alto Trombone Eb3-Eb5",
  } satisfies Partial<RawPlotInputs>),
];
