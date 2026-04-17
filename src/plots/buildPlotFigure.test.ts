import { describe, expect, it } from "vitest";
import { buildPlotFigure } from "./buildPlotFigure";

describe("buildPlotFigure", () => {
  it("generates x/y data with the requested number of points", () => {
    const figure = buildPlotFigure({ points: 4 });
    const trace = figure.data[0];

    expect(trace.x).toEqual([1, 2, 3, 4]);
    expect(trace.y).toEqual([1, 4, 9, 16]);
  });

  it("includes a title that reflects point count", () => {
    const figure = buildPlotFigure({ points: 7 });
    expect(figure.layout.title).toContain("7");
  });
});
