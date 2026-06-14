import type { RawPlotInputs } from "../parsing/plotInputsSchema";
import { plotInputsRawSchema } from "../parsing/plotInputsSchema";

export const placeholderInputs: RawPlotInputs = plotInputsRawSchema.parse({
  notesString: "Bb1 C2 D2",
} satisfies Partial<RawPlotInputs>);

export const exampleInputs: RawPlotInputs[] = [
  plotInputsRawSchema.parse({
    notesString: "Bb2-Bb4",
    title: "Bb/F Trombone Bb2-Bb4",
  } satisfies Partial<RawPlotInputs>),
  plotInputsRawSchema.parse({
    notesString: "Bb1-Bb3",
    valvesString: "Bb/F/Gb/D",
    title: "Bb/F/Gb/D Trombone Bb1-Bb3",
  } satisfies Partial<RawPlotInputs>),
];
