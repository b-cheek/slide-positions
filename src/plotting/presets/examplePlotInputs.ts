import type { PlotInputs } from "../types/plotInputs";

export const defaultOptions = {
  valvesString: "Bb/F",
  topSlideNote: "Bb1",
  bottomSlideNote: "E1",
  lipBendStartNote: "Bb1",
  lipBendStopNote: "A1",
} as const;

export const exampleInputs: PlotInputs = {
  notesString: "Bb1 C2 D2 Eb2 E2 F2 Gb2 G2 Ab2 A2",
  ...defaultOptions,
};

export const placeholderInputs: PlotInputs = {
  notesString: "Bb2 D3 F3",
  ...defaultOptions,
};
