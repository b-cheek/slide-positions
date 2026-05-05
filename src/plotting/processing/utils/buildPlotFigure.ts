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

export function buildPlotModel(inputs: ParsedPlotInputs): PlotModel {
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

  return {
    title: inputs.title,
    notes: inputs.notes,
    trombone,
    player,
  };
}
