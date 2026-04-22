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
    const match = pitchClass.match(/(\d*)([+-]?\d+\.?\d*)$/);

    let octave = "1";
    let adjustment = 0 as Semitones;
    let basePitchClass = pitchClass;

    if (match && match.index !== undefined) {
      basePitchClass = pitchClass.slice(0, match.index);
      octave = match[1] || "1";
      adjustment = (Number(match[2]) / 100) as Semitones;
    }

    const note = Note.fromSciNotation(`${basePitchClass}${octave}`);
    const length = (freqToLength(note.freq) *
      2 ** (-adjustment / 12)) as Meters;

    return new Tuning(length, `${basePitchClass} tuning`);
  }
}
