import { describe, expect, it } from "vitest";
import { Trombone } from "../types/trombone";
import { Note } from "../types/note";
import { getSlideInfo, getLipBendRange } from "./buildPlotFigure";

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

describe("getLipBendRange", () => {
  it("calculates lip bend range for simple notes", () => {
    const range = getLipBendRange(
      Note.fromSciNotation("Bb1"),
      Note.fromSciNotation("G1"),
    );

    expect(range).toBeCloseTo(9.27, 2);
  });
});

// TODO: move these tests to correct spot once fully implemented
// describe("buildPlotFigure", () => {
//   it("builds a plot figure for simple inputs", () => {
//     const inputs = {
//       notes: [
//         Note.fromSciNotation("Bb1"),
//         Note.fromSciNotation("C2"),
//         Note.fromSciNotation("D2"),
//       ],
//       tunings: [Tuning.fromPitchClassOrPitch("Bb")],
//       topSlideNote: Note.fromSciNotation("Bb1"),
//       bottomSlideNote: Note.fromSciNotation("E1"),
//       lipBendStartNote: Note.fromSciNotation("Bb1"),
//       lipBendStopNote: Note.fromSciNotation("G1"),
//     };

//     const figure = buildPlotFigure(inputs);

//     expect(figure).toBeDefined();
//     // TODO: more specific checks
//   });

//   it("plots a lip bent note", () => {
//     const inputs = {
//       notes: [Note.fromSciNotation("B2")],
//       tunings: [Tuning.fromPitchClassOrPitch("Bb")],
//       topSlideNote: Note.fromSciNotation("Bb1"),
//       bottomSlideNote: Note.fromSciNotation("E1"),
//       lipBendStartNote: Note.fromSciNotation("Bb1"),
//       lipBendStopNote: Note.fromSciNotation("G1"),
//     };

//     const figure = buildPlotFigure(inputs);

//     expect(figure).toBeDefined();
//     const points = figure.points;
//     expect(points).toHaveLength(1);
//     const { x, y } = points[0];
//     expect(y).toBe(Note.fromSciNotation("B2").midiNum);
//     expect(x).toBe(new Trombone().slideLength);
//   });

// TODO: more tests for common use cases
// });
