import type { RawPlotInputs } from "../parsing/plotInputsSchema";
import { plotInputsRawSchema } from "../parsing/plotInputsSchema";

export const placeholderInputs: RawPlotInputs = plotInputsRawSchema.parse({
  notesString: "Bb1 C2 D2",
} satisfies Partial<RawPlotInputs>);

export const exampleInputs: RawPlotInputs = plotInputsRawSchema.parse({
  notesString: "Bb2 C3 D3 Eb3 F3 G3 A3 Bb3",
} satisfies Partial<RawPlotInputs>);
