import { describe, expect, it } from "vitest";
import { Trombone } from "../types/trombone";
import { Note } from "../types/note";
import {
  getSlideInfo,
  getLipBendRange,
  parsePlotInputs,
  buildPlotFigure,
} from "./buildPlotFigure";

// TODO: add random fuzzy tests and check that points, ticks are reasonable

describe("getSlideInfo", () => {
  it("calculates slide info for simple notes", () => {
    const { firstPosDistance, slideLength } = getSlideInfo(
      Note.fromSciNotation("Bb1"),
      Note.fromSciNotation("E1"),
    );

    expect(firstPosDistance).toBe(0);
    expect(slideLength).toBe(new Trombone().slideLength);
  });

  it("calculates slide info for realistic notes", () => {
    const { firstPosDistance, slideLength } = getSlideInfo(
      Note.fromSciNotation("Bb1+5"),
      Note.fromSciNotation("E1-20"),
    );
    // More accurate checks?
    expect(firstPosDistance).toBeGreaterThan(0);
    expect(slideLength).toBeGreaterThan(new Trombone().slideLength);

    // TODO: Check that B2 accessible? C1?
  });
});

// TODO
// describe("buildPlotFigure", () => {});
