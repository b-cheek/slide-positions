import { Note } from "./note";

import { freqToLength } from "../utils";

export class Tuning {
  public readonly length: number;

  // Name is required so it matches input pitch class
  public readonly name: string;

  public constructor(length: number, name: string) {
    this.length = length;
    this.name = name;
  }

  public static fromPitchClass(pitchClass: string): Tuning {
    const match = pitchClass.match(/(\d*)([+-]?\d+\.?\d*)$/);

    let octave = "1";
    let adjustment = 0;
    let basePitchClass = pitchClass;

    if (match && match.index !== undefined) {
      basePitchClass = pitchClass.slice(0, match.index);
      octave = match[1] || "1";
      adjustment = Number(match[2]) / 100;
    }

    const note = Note.fromSciNotation(`${basePitchClass}${octave}`);
    const length = freqToLength(note.freq) * 2 ** (-adjustment / 12);

    return new Tuning(length, `${basePitchClass} valve`);
  }
}
