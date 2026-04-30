import { describe, expect, it } from "vitest";
import { Note } from "../types/note";
import { getNotesInRange } from "./music";

describe("getNotesInRange", () => {
  it("returns notes in the correct range", () => {
    const startNote = Note.fromSciNotation("C4");
    const stopNote = Note.fromSciNotation("E4");
    const notesInRange = getNotesInRange(startNote, stopNote);
    expect(notesInRange.map((n) => n.name)).toEqual(["Db4", "D4", "Eb4"]);
  });

  it("returns notes in descending order when the range is reversed", () => {
    const startNote = Note.fromSciNotation("E4");
    const stopNote = Note.fromSciNotation("C4");
    const notesInRange = getNotesInRange(startNote, stopNote);
    expect(notesInRange.map((n) => n.name)).toEqual(["Eb4", "D4", "Db4"]);
  });
});
