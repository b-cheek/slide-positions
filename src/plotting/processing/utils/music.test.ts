import { describe, expect, it } from "vitest";
import { Note } from "../types/note";
import { freqToMidiNum, getNotesInRange, midiNumToFreq } from "./music";

describe("getNotesInRange", () => {
  it("returns notes in the correct range", () => {
    const startNote = Note.fromSciNotation("C4");
    const stopNote = Note.fromSciNotation("E4");
    const notesInRange = getNotesInRange(startNote, stopNote);
    expect(notesInRange.map((n) => n.name)).toEqual([
      "C4",
      "Db4",
      "D4",
      "Eb4",
      "E4",
    ]);
  });

  it("returns notes in descending order when the range is reversed", () => {
    const startNote = Note.fromSciNotation("E4");
    const stopNote = Note.fromSciNotation("C4");
    const notesInRange = getNotesInRange(startNote, stopNote);
    expect(notesInRange.map((n) => n.name)).toEqual([
      "E4",
      "Eb4",
      "D4",
      "Db4",
      "C4",
    ]);
  });

  it("filters notes based on the specified key", () => {
    const startNote = Note.fromSciNotation("C3");
    const stopNote = Note.fromSciNotation("C4");
    const notesInRange = getNotesInRange(startNote, stopNote, "Bb");
    expect(notesInRange.map((n) => n.name)).toEqual([
      "C3",
      "D3",
      "Eb3",
      "F3",
      "G3",
      "A3",
      "Bb3",
      "C4",
    ]);
  });
});

describe("freqToMidiNum and midiNumToFreq", () => {
  const testFreqs = [440, 261.63, 329.63, 493.88]; // A4, C4, E4, B4
  it("converts frequencies to MIDI numbers accurately", () => {
    const expectedMidiNums = [69, 60, 64, 71];
    testFreqs.forEach((freq, i) => {
      const midiNum = freqToMidiNum(freq);
      expect(midiNum).toBe(expectedMidiNums[i]);
    });
  });

  it("converts frequencies to MIDI numbers and back accurately", () => {
    testFreqs.forEach((freq) => {
      const midiNum = freqToMidiNum(freq);
      const convertedFreq = midiNumToFreq(midiNum);
      expect(convertedFreq).toBeCloseTo(freq, 2); // Allow for minor rounding differences
    });
  });
});
