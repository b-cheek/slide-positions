import { Note } from "./note";
import type { Meters, Semitones, Cents } from "./constants";

import { freqToLength } from "../utils";

export class Tuning {
  public readonly length: Meters;

  // Name is required so it matches input pitch class
  public readonly name: string;

  public constructor(length: Meters, name: string) {
    this.length = length;
    this.name = name;
  }

  // TODO: rename since can take true pitch
  public static fromPitchClass(pitchClass: string): Tuning {
    const match = pitchClass.match(/(\d*)([+-]\d+\.?\d*)?$/);

    let octave = "1";
    let adjustment = "+0";
    let basePitchClass = pitchClass;

    // Check that match exists and is not empty
    if (match && match[0]) {
      basePitchClass = pitchClass.slice(0, match.index);
      if (match[1]) {
        octave = match[1];
      }
      if (match[2]) {
        adjustment = match[2];
      }
    }

    const length = freqToLength(
      Note.fromSciNotation(`${basePitchClass}${octave}${adjustment}`).freq,
    ) as Meters;

    return new Tuning(length, `${basePitchClass} tuning`);
  }
}
