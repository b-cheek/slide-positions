import type { RawPlotInputs } from "../parsing/plotInputsSchema";
import { plotInputsRawSchema } from "../parsing/plotInputsSchema";

export const exampleInputs: RawPlotInputs = plotInputsRawSchema.parse({
  notesString: "Bb2 C3 D3 Eb3 F3 G3 A3 Bb3",
});
