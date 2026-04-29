import type { PlotInputs } from "../types/plotInputs";
import { exampleInputs } from "./examplePlotInputs";

const presetPlotInputs: Record<string, PlotInputs> = {
  "example-plot": exampleInputs,
};

export function getPresetPlotInputs(plotId: string) {
  return presetPlotInputs[plotId];
}
