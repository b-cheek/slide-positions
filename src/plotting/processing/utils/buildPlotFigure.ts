import { Hertz, Meters, MidiNumber } from "../..";
import type { PlotModel } from "../../types/plotModel";
import type { ParsedPlotInputs } from "../../types/plotInputs";
import { Note } from "../types/note";
import { Player } from "../types/player";
import { Trombone } from "../types/trombone";
import { freqToLength } from "./physics";

export function getSlideInfo(
  topSlideNote: Note,
  bottomSlideNote: Note,
): { firstPosDistance: Meters; slideLength: Meters } {
  // TODO: figure out a way to account for any partial based on tunings?
  const topSlideFreq = topSlideNote.freq;
  const bottomSlideFreq = bottomSlideNote.freq;

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
  lipBendStartNote: Note,
  lipBendStopNote: Note,
): Hertz {
  return (lipBendStartNote.freq - lipBendStopNote.freq) as Hertz;
}

export function buildPlotModel(inputs: ParsedPlotInputs): {
  notes: Note[];
  trombone: Trombone;
  player: Player;
} {
  const { firstPosDistance, slideLength } = getSlideInfo(
    inputs.topSlideNote,
    inputs.bottomSlideNote,
  );
  const lipBendRange = getLipBendRange(
    inputs.lipBendStartNote,
    inputs.lipBendStopNote,
  );

  const trombone = new Trombone(inputs.tunings, slideLength);
  const player = new Player(lipBendRange, firstPosDistance);

  return { notes: inputs.notes, trombone, player };
}

export function buildPlotFigure(inputs: ParsedPlotInputs): PlotModel {
  const { notes, trombone, player } = buildPlotModel(inputs);

  const noteConfigs = notes.flatMap((note) =>
    trombone.getNoteConfigs(note, player),
  );

  const points = noteConfigs.map((config) => ({
    x: config.slideDistance,
    y: config.note.midiNum,
  }));

  return {
    notes,
    trombone,
    player,
    noteConfigs: noteConfigs.map((c) => ({
      noteName: c.note.name,
      midiNum: c.note.midiNum,
      slideDistance: c.slideDistance,
      tuningIndex: trombone.tunings.indexOf(c.tuning),
      meta: { partial: c.partial, lipBendCents: c.lipBendCents },
    })),
    rawNoteConfigs: noteConfigs,
    points,
    title: "Trombone Slide Positions",
  };
}
