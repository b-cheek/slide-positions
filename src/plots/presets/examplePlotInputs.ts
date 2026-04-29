import type { PlotInputs } from "../types/plotInputs";

export const examplePlotInputDefaults = {
  valvesString: "Bb/F",
  topSlideNote: "Bb1",
  bottomSlideNote: "E1",
  lipBendStartNote: "Bb1",
  lipBendStopNote: "A1",
} as const;

export const examplePlotInputs: PlotInputs = {
  notesString: "Bb1, C2, D2, Eb2, E2, F2, Gb2, G2, Ab2, A2",
  ...examplePlotInputDefaults,
};
