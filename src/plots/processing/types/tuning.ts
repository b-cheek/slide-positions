import { Note } from "./note";
import type { Meters } from "./constants";
import { PITCH_CLASS_REGEX, OCTAVE_REGEX, NOTE_ADJUSTMENT_REGEX } from "./note";

import { freqToLength } from "../utils/physics";

export const TUNING_REGEX = new RegExp(
  `(?:${PITCH_CLASS_REGEX.source}${OCTAVE_REGEX.source}?${NOTE_ADJUSTMENT_REGEX.source})`,
);

export class Tuning {
  public readonly length: Meters;

  // Name is required so it matches input pitch class
  public readonly name: string;

  public constructor(length: Meters, name: string) {
    this.length = length;
    this.name = name;
  }

  // TODO: rename since can take true pitch
  public static fromPitchClassOrPitch(pitchClass: string): Tuning {
    const parseRegex = new RegExp(
      `(?<pitch>${PITCH_CLASS_REGEX.source})` +
        `(?<octave>${OCTAVE_REGEX.source})?` +
        `(?<adjustment>${NOTE_ADJUSTMENT_REGEX.source})`,
    );
    const match = pitchClass.match(parseRegex);

    if (!match?.groups?.pitch) {
      throw new Error(`Invalid tuning input: ${pitchClass}`);
    }

    const basePitchClass = match.groups.pitch;
    // Defaults to match majority tenor and bass tunings
    const octave = match.groups.octave || "1";
    const adjustment = match.groups.adjustment || "+0";

    const length = freqToLength(
      Note.fromSciNotation(`${basePitchClass}${octave}${adjustment}`).freq,
    ) as Meters;

    return new Tuning(length, `${basePitchClass} tuning`);
  }
}
