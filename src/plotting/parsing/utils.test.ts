import { describe, expect, it } from "vitest";
import { Trombone } from "../processing/types/trombone";
import { Note } from "../processing/types/note";
import { buildPlotModel } from "./utils";
import { ParsedPlotInputs } from "./plotInputsSchema";

// TODO: add random fuzzy tests and check that points, ticks are reasonable

const base_inputs: ParsedPlotInputs = {
  notes: [],
  tunings: [],
  topSlideNote: Note.fromSciNotation("Bb1"),
  bottomSlideNote: Note.fromSciNotation("E1"),
  lipBendStartNote: Note.fromSciNotation("Bb1"),
  lipBendStopNote: Note.fromSciNotation("G1"),
  title: "Test",
};

// TODO: rename to not use old helper names?
describe("getSlideInfo", () => {
  it("calculates slide info for simple inputs", () => {
    const plotModel = buildPlotModel({ ...base_inputs });
    const firstPosDistance = plotModel.player.firstPosDistance;
    const slideLength = plotModel.trombone.slideLength;

    expect(firstPosDistance).toBe(0);
    expect(slideLength).toBe(new Trombone().slideLength);
  });

  it("calculates slide info for realistic top and bottom note", () => {
    const plotModel = buildPlotModel({
      ...base_inputs,
      topSlideNote: Note.fromSciNotation("Bb1+5"),
      bottomSlideNote: Note.fromSciNotation("E1-20"),
    });

    const firstPosDistance = plotModel.player.firstPosDistance;
    const slideLength = plotModel.trombone.slideLength;

    // More accurate checks?
    expect(firstPosDistance).toBeGreaterThan(0);
    expect(slideLength).toBeGreaterThan(new Trombone().slideLength);

    // TODO: Check that B2 accessible? C1?
  });
});

describe("getLipBendRange", () => {
  it("calculates lip bend range for simple notes", () => {
    const plotModel = buildPlotModel({
      ...base_inputs,
      lipBendStartNote: Note.fromSciNotation("Bb1"),
      lipBendStopNote: Note.fromSciNotation("G1"),
    });
    const range = plotModel.player.lipBendRange;
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
