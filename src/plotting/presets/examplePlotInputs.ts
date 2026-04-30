import type { PlotInputs } from "../types/plotInputs";
import { defaultOptions } from "./defaults";

export const exampleInputs: PlotInputs = {
  notesString: "Bb2 C3 D3 Eb3 F3 G3 A3 Bb3",
  ...defaultOptions,
};

export const placeholderInputs: PlotInputs = {
  notesString: "Bb2 D3 F3",
  ...defaultOptions,
};
