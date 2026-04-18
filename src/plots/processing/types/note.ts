import { A4_FREQ, MIDI_LIST, NOTE_OFFSETS } from "./noteConstants";

export class Note {
  public readonly pitchClass: string;

  public readonly octave: number;

  public readonly adjustment: number;

  private readonly midiNumValue: number;

  private readonly freqValue: number;

  public constructor(pitchClass: string, octave: number, adjustment = 0) {
    this.pitchClass = pitchClass;
    this.octave = octave;
    this.adjustment = adjustment;

    this.midiNumValue =
      (this.octave + 1) * 12 + NOTE_OFFSETS[this.pitchClass] + this.adjustment;
    const distFromA4 = this.midiNumValue - 69;
    this.freqValue = A4_FREQ * 2 ** (distFromA4 / 12);

    Object.freeze(this);
  }

  public get name(): string {
    return `${this.pitchClass}${this.octave}`;
  }

  public get midi_num(): number {
    return this.midiNumValue;
  }

  public get freq(): number {
    return this.freqValue;
  }

  public static fromSciNotation(note: string): Note {
    const match = note.match(/(\d+)([+-]?\d+\.?\d*)$/);

    if (match && match.index !== undefined) {
      return new Note(
        note.slice(0, match.index),
        Number.parseInt(match[1], 10),
        Number(match[2]) / 100,
      );
    }

    return new Note(note.slice(0, -1), Number.parseInt(note.slice(-1), 10));
  }

  public static fromMidiNum(midiNum: number): Note {
    const integerPart = Math.floor(midiNum);
    const adjustment = midiNum - integerPart;

    return new Note(
      MIDI_LIST[integerPart % 12],
      Math.floor(integerPart / 12) - 1,
      adjustment,
    );
  }
}
