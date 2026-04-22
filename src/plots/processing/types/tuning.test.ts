import { describe, expect, it } from "vitest";
import { Note } from "./note";
import { Tuning } from "./tuning";
import { freqToLength } from "../utils";
import { Cents } from "./constants";

describe("Tuning.fromPitchClassOrPitch", () => {
  it("uses default octave and no adjustment", () => {
    const tuning = Tuning.fromPitchClassOrPitch("Bb");
    const expected = freqToLength(new Note("Bb", 1, 0 as Cents).freq);

    expect(tuning.name).toBe("Bb tuning");
    expect(tuning.length).toBe(expected);
  });

  it("parses octave-only inputs", () => {
    const tuning = Tuning.fromPitchClassOrPitch("Bb2");
    const expected = freqToLength(new Note("Bb", 2, 0 as Cents).freq);

    expect(tuning.length).toBe(expected);
  });

  it("parses adjustment-only inputs", () => {
    const tuning = Tuning.fromPitchClassOrPitch("F+2");
    const expected = freqToLength(new Note("F", 1, 2 as Cents).freq);

    expect(tuning.length).toBe(expected);
  });

  it("parses both octave and adjustment", () => {
    const tuning = Tuning.fromPitchClassOrPitch("F2+2");
    const expected = freqToLength(new Note("F", 2, 2 as Cents).freq);

    expect(tuning.length).toBe(expected);
  });
});
