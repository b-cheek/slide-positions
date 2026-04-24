import { describe, expect, it } from "vitest";
import { Trombone } from "../types/trombone";
import {
  parseNotes,
  parseValves,
  getSlideInfo,
  getLipBendRange,
  parsePlotInputs,
  buildPlotFigure,
} from "./buildPlotFigure";

// TODO: add random fuzzy tests and check that points, ticks are reasonable

describe("parseNotes", () => {
  it("parses single note strings", () => {
    const notesString = "Bb2";
    const result = parseNotes(notesString);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Bb2");
  });

  it("parses multi note strings", () => {
    const notesString = "Bb2 C3 D4";
    const result = parseNotes(notesString);

    expect(result).toHaveLength(3);
    expect(result[0].name).toBe("Bb2");
    expect(result[1].name).toBe("C3");
    expect(result[2].name).toBe("D4");
  });
});

describe("parseValves", () => {
  it("parses single valve strings", () => {
    const valvesString = "Bb";
    const result = parseValves(valvesString);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Bb tuning");
  });

  it("parses multi valve strings", () => {
    const valvesString = "Bb/F";
    const result = parseValves(valvesString);

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Bb tuning");
    expect(result[1].name).toBe("F tuning");
  });
});

describe("getSlideInfo", () => {
  it("calculates slide info for simple notes", () => {
    const { firstPosDistance, slideLength } = getSlideInfo("Bb1", "E1");

    expect(firstPosDistance).toBe(0);
    expect(slideLength).toBe(new Trombone().slideLength);
  });

  it("calculates slide info for realistic notes", () => {
    const { firstPosDistance, slideLength } = getSlideInfo("Bb1+5", "E1-20");
    // More accurate checks?
    expect(firstPosDistance).toBeGreaterThan(0);
    expect(slideLength).toBeGreaterThan(new Trombone().slideLength);

    // TODO: Check that B2 accessible? C1?
  });
});

// TODO
// describe("buildPlotFigure", () => {});
