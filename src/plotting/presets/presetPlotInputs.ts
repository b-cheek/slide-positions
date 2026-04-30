import type { PlotInputs } from "../types/plotInputs";
import { exampleInputs } from "./examplePlotInputs";

// Map name to preset plot inputs for url
const presetPlotInputs: Record<string, PlotInputs> = {
  "Bb-scale-default": exampleInputs,
};

export function getPresetPlotInputs(plotId: string) {
  return presetPlotInputs[plotId];
}
