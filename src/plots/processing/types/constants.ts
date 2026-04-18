export type Brand<TValue, TUnit extends string> = TValue & {
  readonly __brand: TUnit;
};

export type Hertz = Brand<number, "Hertz">;
export type Meters = Brand<number, "Meters">;
export type MetersPerSecond = Brand<number, "MetersPerSecond">;
export type MidiNumber = Brand<number, "MidiNumber">;
export type Semitones = Brand<number, "SemitoneOffset">;
export type RelativePosition = Brand<number, "RelativePosition">;

export const SPEED_OF_SOUND = 343 as MetersPerSecond; // m/s at sea level and 20°C

export const A4_FREQ = 440 as Hertz;

export const NOTE_OFFSETS: Record<string, number> = {
  C: 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  F: 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
};

// These will be used as preferred repr of pitch classes
export const MIDI_LIST = [
  "C",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "Gb",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
];

// TODO: add pitch class enum?
