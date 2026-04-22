import { describe, expect, it } from "vitest";
import type { MidiNumber } from "./constants";
import { Note } from "./note";

describe("Note factories", () => {
  it("fromSciNotation parses note name and octave", () => {
    const note = Note.fromSciNotation("C4");

    expect(note.pitchClass).toBe("C");
    expect(note.octave).toBe(4);
    expect(note.name).toBe("C4");
    expect(note.midiNum).toBe(60);
    expect(note.freq).toBeCloseTo(261.6255653, 6);
  });

  it("fromSciNotation parses signed cent adjustment", () => {
    const note = Note.fromSciNotation("A4+50");

    expect(note.adjustment).toBe(0.5);
    expect(note.midiNum).toBe(69.5);
    expect(note.freq).toBeCloseTo(440 * 2 ** (0.5 / 12), 8);
  });

  it("fromMidiNum builds expected pitch for an integer midi value", () => {
    const note = Note.fromMidiNum(69 as MidiNumber);

    expect(note.pitchClass).toBe("A");
    expect(note.octave).toBe(4);
    expect(note.adjustment).toBe(0);
    expect(note.freq).toBeCloseTo(440, 8);
  });

  it("fromMidiNum preserves fractional midi adjustment", () => {
    const note = Note.fromMidiNum(60.25 as MidiNumber);

    expect(note.pitchClass).toBe("C");
    expect(note.octave).toBe(4);
    expect(note.adjustment).toBeCloseTo(0.25, 8);
  });
});
