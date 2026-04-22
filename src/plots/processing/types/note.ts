import {
  A4_FREQ,
  MIDI_LIST,
  NOTE_OFFSETS,
  type Hertz,
  type MidiNumber,
  type Cents,
} from "./constants";

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
    const match = note.match(/(\d+)([+-]\d+\.?\d*)?$/);

    if (match && match.index !== undefined) {
      return new Note(
        note.slice(0, match.index),
        Number.parseInt(match[1]),
        (match[2] ? Number(match[2]) : 0) as Cents,
      );
    }

    return new Note(note.slice(0, -1), Number.parseInt(note.slice(-1), 10));
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
