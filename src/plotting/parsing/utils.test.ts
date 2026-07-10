import { describe, expect, it } from "vitest";
import { Trombone } from "../processing/types/trombone";
import { Note } from "../processing/types/note";
import { buildPlotModel } from "./utils";
import { ParsedPlotInputs } from "./plotInputsSchema";
import { NoteConfiguration } from "../processing/types/noteConfiguration";
import { Tuning } from "../processing/types/tuning";
import { getNoteConfigs } from "../processing/utils/slideCalculation";

// TODO: add random fuzzy tests and check that points, ticks are reasonable

const base_inputs: ParsedPlotInputs = {
  notes: [],
  tunings: [Tuning.fromPitchClassOrPitch("Bb")],
  topSlideNote: Note.fromSciNotation("Bb1"),
  bottomSlideNote: Note.fromSciNotation("E1"),
  lipBendStartNote: Note.fromSciNotation("Bb1"),
  lipBendStopNote: Note.fromSciNotation("Bb1"),
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

const buildPlotFigure = (inputs: ParsedPlotInputs): NoteConfiguration[] => {
  const plotModel = buildPlotModel(inputs);
  const noteConfigs = plotModel.notes.flatMap((note) =>
    getNoteConfigs(plotModel.trombone, note, plotModel.player),
  );
  return noteConfigs;
};

describe("buildPlotFigure", () => {
  it("builds a plot figure for simple inputs", () => {
    const configs = buildPlotFigure({
      ...base_inputs,
      notes: [
        Note.fromSciNotation("Bb1"),
        Note.fromSciNotation("C2"),
        Note.fromSciNotation("D2"),
      ],
    });

    expect(configs).toBeDefined();
    // TODO: more specific checks
  });

  it("plots a lip bent note", () => {
    const configs = buildPlotFigure({
      ...base_inputs,
      notes: [Note.fromSciNotation("B2")],
      lipBendStartNote: Note.fromSciNotation("Bb1"),
      lipBendStopNote: Note.fromSciNotation("G1"),
    });

    expect(configs).toBeDefined();
    expect(configs).toHaveLength(1);
    const config = configs[0];
    expect(config.note).toStrictEqual(Note.fromSciNotation("B2"));
    expect(config.slideDistance).toBe(new Trombone().slideLength);
  });

  // TODO: more tests for common use cases
});
