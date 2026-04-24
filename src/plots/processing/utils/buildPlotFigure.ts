import { Hertz, Meters, MidiNumber } from "../..";
import type { PlotFigure } from "../../types/plotFigure";
import type { PlotInputs } from "../../types/plotInputs";
import { Note } from "../types/note";
import { Player } from "../types/player";
import { Trombone } from "../types/trombone";
import { Tuning } from "../types/tuning";
import { freqToLength } from "./physics";

export function parseNotes(notesString: string): Note[] {
  return notesString
    .split(" ")
    .map((noteStr) => Note.fromSciNotation(noteStr.trim()));
}

export function parseValves(valvesString: string): Tuning[] {
  return valvesString
    .split("/")
    .map((valveStr) => Tuning.fromPitchClassOrPitch(valveStr.trim()));
}

export function getSlideInfo(
  topSlideNoteStr: string,
  bottomSlideNoteStr: string,
): { firstPosDistance: Meters; slideLength: Meters } {
  // TODO: figure out a way to account for any partial based on tunings?
  const topSlideNote = Note.fromSciNotation(topSlideNoteStr);
  const topSlideFreq = topSlideNote.freq;
  const bottomSlideFreq = Note.fromSciNotation(bottomSlideNoteStr).freq;

  const slideLength = (freqToLength(bottomSlideFreq) -
    freqToLength(topSlideFreq)) as Meters;

  // First pos note is first in tune note moving out from mid slide distance
  const firstPosNote = Note.fromMidiNum(
    Math.floor(topSlideNote.midiNum) as MidiNumber,
  );
  const firstPosDistance = (freqToLength(firstPosNote.freq) -
    freqToLength(topSlideFreq)) as Meters;

  return { firstPosDistance, slideLength };
}

export function getLipBendRange(
  lipBendStartNoteStr: string,
  lipBendStopNoteStr: string,
): Hertz {
  const lipBendStartFreq = Note.fromSciNotation(lipBendStartNoteStr).freq;
  const lipBendStopFreq = Note.fromSciNotation(lipBendStopNoteStr).freq;
  return (lipBendStopFreq - lipBendStartFreq) as Hertz;
}

export function parsePlotInputs(inputs: PlotInputs): {
  notes: Note[];
  trombone: Trombone;
  player: Player;
} {
  const notes = parseNotes(inputs.notesString);
  const tunings = parseValves(inputs.valvesString);
  const { firstPosDistance, slideLength } = getSlideInfo(
    inputs.topSlideNote,
    inputs.bottomSlideNote,
  );
  const lipBendRange = getLipBendRange(
    inputs.lipBendStartNote,
    inputs.lipBendStopNote,
  );

  const trombone = new Trombone(tunings, slideLength);
  const player = new Player(lipBendRange, firstPosDistance);

  return { notes, trombone, player };
}

export function buildPlotFigure(inputs: PlotInputs): PlotFigure {
  const { notes, trombone, player } = parsePlotInputs(inputs);

  const noteConfigs = notes.flatMap((note) =>
    trombone.getNoteConfigs(note, player),
  );

  const x = noteConfigs.map((config) => config.slideDistance);
  const y = noteConfigs.map((config) => config.note.midiNum);

  return {
    data: [
      {
        mode: "markers",
        type: "scatter",
        x,
        y,
        name: "test",
      },
    ],
    layout: {
      title: `test`,
      xaxis: { title: "x" },
      yaxis: { title: "y" },
    },
  };
}
