import {
  A4_FREQ,
  MIDI_LIST,
  NOTE_OFFSETS,
  type Hertz,
  type MidiNumber,
  type Semitones,
} from "./constants";

export class Note {
  public readonly pitchClass: string;

  public readonly octave: number;

  public readonly adjustment: Semitones;

  private readonly midiNumValue: MidiNumber;

  private readonly freqValue: Hertz;

  public constructor(
    pitchClass: string,
    octave: number,
    adjustment = 0 as Semitones,
  ) {
    this.pitchClass = pitchClass;
    this.octave = octave;
    this.adjustment = adjustment;

    this.midiNumValue = ((this.octave + 1) * 12 +
      NOTE_OFFSETS[this.pitchClass] +
      this.adjustment) as MidiNumber;
    const distFromA4 = this.midiNumValue - 69;
    this.freqValue = (A4_FREQ * 2 ** (distFromA4 / 12)) as Hertz;

    Object.freeze(this); // TODO: remove?
  }

  public get name(): string {
    return `${this.pitchClass}${this.octave}`;
  }

  public get midi_num(): MidiNumber {
    return this.midiNumValue;
  }

  public get freq(): Hertz {
    return this.freqValue;
  }

  public static fromSciNotation(note: string): Note {
    const match = note.match(/(\d+)([+-]?\d+\.?\d*)$/);

    if (match && match.index !== undefined) {
      return new Note(
        note.slice(0, match.index),
        Number.parseInt(match[1], 10),
        (Number(match[2]) / 100) as Semitones,
      );
    }

    return new Note(note.slice(0, -1), Number.parseInt(note.slice(-1), 10));
  }

  public static fromMidiNum(midiNum: MidiNumber): Note {
    const integerPart = Math.floor(midiNum);
    const adjustment = (midiNum - integerPart) as Semitones;

    return new Note(
      MIDI_LIST[integerPart % 12],
      Math.floor(integerPart / 12) - 1,
      adjustment,
    );
  }
}
