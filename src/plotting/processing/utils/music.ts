import { NOTE_OFFSETS, type MidiNumber } from "../types/constants";
import { Note } from "../types/note";

export function getNotesInRange(
  startNote: Note,
  stopNote: Note,
  key?: string,
): Note[] {
  const notes: Note[] = [];
  const startMidi = startNote.midiNum;
  const stopMidi = stopNote.midiNum;

  if (startMidi === stopMidi) {
    return notes;
  }

  const step = startMidi < stopMidi ? 1 : -1;

  // NOTE: this is inclusive
  for (
    let midiNum = startMidi;
    step > 0 ? midiNum <= stopMidi : midiNum >= stopMidi;
    midiNum = (midiNum + step) as MidiNumber
  ) {
    notes.push(Note.fromMidiNum(midiNum));
  }

  if (key) {
    return notes.filter((note) => {
      const keyOffset = NOTE_OFFSETS[key];
      const midiOffset = note.midiNum % 12;
      const relativeOffset = (midiOffset - keyOffset + 12) % 12;
      return [0, 2, 4, 5, 7, 9, 11].includes(relativeOffset);
    });
  }

  return notes;
}

export function freqToMidiNum(freq: number): MidiNumber {
  return Math.round(69 + 12 * Math.log2(freq / 440)) as MidiNumber;
}

export function midiNumToFreq(midiNum: MidiNumber): number {
  return 440 * Math.pow(2, (midiNum - 69) / 12);
}
