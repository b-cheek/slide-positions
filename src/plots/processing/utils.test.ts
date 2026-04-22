import { describe, expect, it } from "vitest";
import type { Hertz, Meters } from "./types/constants";
import { lengthToFreq, freqToLength } from "./utils";

describe("processing utils", () => {
  it("computes expected tube length for 440 Hz", () => {
    const length = freqToLength(440 as Hertz);
    expect(length).toBeCloseTo(343 / 880, 10);
  });

  it("round-trips length and frequency", () => {
    const startLength = 2.5 as Meters;
    const freq = lengthToFreq(startLength);
    const resultLength = freqToLength(freq);

    expect(resultLength).toBeCloseTo(startLength, 10);
  });
});
