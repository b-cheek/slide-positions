import type { PlotFigure } from "../types/plotFigure";
import type { PlotInputs } from "../types/plotInputs";

export function buildPlotFigure(inputs: PlotInputs): PlotFigure {
  const x = Array.from({ length: inputs.points }, (_, i) => i + 1);
  const y = x.map((value) => value * value);

  return {
    data: [
      {
        type: "scatter",
        mode: "lines+markers",
        x,
        y,
        name: "y = x^2",
      },
    ],
    layout: {
      title: `Generated Plot (${inputs.points} points)`,
      xaxis: { title: "x" },
      yaxis: { title: "y" },
    },
  };
}
