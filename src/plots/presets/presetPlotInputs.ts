import type { PlotInputs } from "../types/plotInputs";
import { examplePlotInputs } from "./examplePlotInputs";

const presetPlotInputs: Record<string, PlotInputs> = {
  "example-plot": examplePlotInputs,
};

export function getPresetPlotInputs(plotId: string) {
  return presetPlotInputs[plotId];
}
