import {
  A4_FREQ,
  MIDI_LIST,
  NOTE_OFFSETS,
  type Hertz,
  type MidiNumber,
  type Cents,
} from "./constants";

export const PITCH_CLASS_REGEX = /(?:[A-G][b#]?)/;
export const OCTAVE_REGEX = /(?:\d+)/;
export const NOTE_NAME_REGEX = new RegExp(
  `(?:${PITCH_CLASS_REGEX.source}${OCTAVE_REGEX.source})`,
);
export const NOTE_ADJUSTMENT_REGEX = /(?:[+-]\d+\.?\d*)?/;
export const SCI_NOTATION_REGEX = new RegExp(
  `(?:${NOTE_NAME_REGEX.source}${NOTE_ADJUSTMENT_REGEX.source})`,
);

export class Note {
  public readonly pitchClass: string;

  public readonly octave: number;

  public readonly adjustment: Cents;

  public readonly name: string;

  public readonly midiNum: MidiNumber;

  public readonly freq: Hertz;

  public constructor(
    pitchClass: string,
    octave: number,
    adjustment = 0 as Cents,
  ) {
    this.pitchClass = pitchClass;
    this.octave = octave;
    this.adjustment = adjustment;

    // Compute other properties
    this.name = `${pitchClass}${octave}`;

    this.midiNum = ((this.octave + 1) * 12 +
      NOTE_OFFSETS[this.pitchClass] +
      this.adjustment / 100) as MidiNumber;
    const distFromA4 = this.midiNum - 69;

    this.freq = (A4_FREQ * 2 ** (distFromA4 / 12)) as Hertz;

    Object.freeze(this);
  }

  public static fromSciNotation(note: string): Note {
    const parseRegex = new RegExp(
      `(?<pitch>${PITCH_CLASS_REGEX.source})` +
        `(?<octave>${OCTAVE_REGEX.source})` +
        `(?<adjustment>${NOTE_ADJUSTMENT_REGEX.source})`,
    );
    const match = note.match(parseRegex) as RegExpMatchArray & {
      groups: {
        pitch: string;
        octave: string;
        adjustment?: string;
      };
    };

    const pitchClass = match.groups.pitch;
    const octave = Number.parseInt(match.groups.octave, 10);
    const adjustment = (
      match.groups.adjustment ? Number(match.groups.adjustment) : 0
    ) as Cents;

    return new Note(pitchClass, octave, adjustment);
  }

  public static fromMidiNum(midiNum: MidiNumber): Note {
    const integerPart = Math.floor(midiNum);
    const adjustment = ((midiNum - integerPart) * 100) as Cents;

    return new Note(
      MIDI_LIST[integerPart % 12],
      Math.floor(integerPart / 12) - 1,
      adjustment,
    );
  }
}
