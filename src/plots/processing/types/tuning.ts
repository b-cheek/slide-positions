import { Note } from "./note";
import type { Meters, Semitones } from "./constants";

import { freqToLength } from "../utils";

export class Tuning {
  public readonly length: Meters;

  // Name is required so it matches input pitch class
  public readonly name: string;

  public constructor(length: Meters, name: string) {
    this.length = length;
    this.name = name;
  }

  public static fromPitchClass(pitchClass: string): Tuning {
    const match = pitchClass.match(/(\d*)([+-]\d+\.?\d*)?$/);

    let octave = "1";
    let adjustment = 0 as Semitones;
    let basePitchClass = pitchClass;

    // Check that match exists and is not empty
    if (match && match[0]) {
      basePitchClass = pitchClass.slice(0, match.index);
      octave = match[1] || "1";
      adjustment = (match[2] || 0 / 100) as Semitones;
    }

    const note = Note.fromSciNotation(`${basePitchClass}${octave}`);
    const length = (freqToLength(note.freq) *
      2 ** (-adjustment / 12)) as Meters;

    return new Tuning(length, `${basePitchClass} tuning`);
  }
}
