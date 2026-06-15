import { z } from "zod";
import { getNotesInRange } from "../processing/utils/music";
import { Hertz, Meters, MidiNumber } from "..";
import type { ParsedPlotInputs } from "./plotInputsSchema";
import { Note } from "../processing/types/note";
import { Player } from "../processing/types/player";
import { Trombone } from "../processing/types/trombone";
import { Tuning } from "../processing/types/tuning";
import { freqToLength } from "../processing/utils/physics";

// General utilities

export const coerceToUndefined = (value: unknown) => {
  // I think reading from the URL params and the initial form load results in undefined values
  // even if this isn't completely necessary, it is helpful
  // TODO: I still have reservations about this...
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
};

// Schema utilities

export const optionalStringWithDefault = (
  regex: RegExp,
  message: string,
  defaultValue: string,
) =>
  z.preprocess(
    coerceToUndefined,
    z.string().regex(regex, { message }).default(defaultValue),
  );

// Input shorthand parsing

export const sciNotationRangeTransform = (value: string) => {
  const [start, stop] = value.split("-").map((s) => s.trim());
  const startNote = Note.fromSciNotation(start);
  const stopNote = Note.fromSciNotation(stop);
  const middleNotes = getNotesInRange(startNote, stopNote);
  return [startNote, ...middleNotes, stopNote];
};

// URL utilities

const PLOT_INPUT_QUERY_KEYS = [
  "notesString",
  "valvesString",
  "topSlideNote",
  "bottomSlideNote",
  "lipBendStartNote",
  "lipBendStopNote",
  "title",
]; // TODO: I hate that I have to have this...

// TODO: enforce stricter typing somehow
export function readPlotInputRawValues(searchParams: URLSearchParams) {
  return Object.fromEntries(
    PLOT_INPUT_QUERY_KEYS.map((key) => [
      key,
      coerceToUndefined(searchParams.get(key)), // Perhaps better way to extract params with names?
    ]).filter(([, value]) => value !== undefined),
  );
}

// Transform ParsedPlotInputs into PlotModel

// TODO should this live somewhere else?
export type PlotModel = {
  title: string;
  notes: Note[];
  trombone: Trombone;
  player: Player;
};

export function buildPlotModel({
  notes,
  tunings,
  topSlideNote,
  bottomSlideNote,
  lipBendStartNote,
  lipBendStopNote,
  title,
}: ParsedPlotInputs): PlotModel {
  // Get slide length
  // TODO: figure out a way to account for any partial based on tunings?
  const topSlideFreq = topSlideNote.freq;
  const bottomSlideFreq = bottomSlideNote.freq;

  const slideLength = (freqToLength(bottomSlideFreq) -
    freqToLength(topSlideFreq)) as Meters;

  // Get first pos distance
  // First pos note is first in tune note moving out from mid slide distance
  const firstPosNote = Note.fromMidiNum(
    Math.floor(topSlideNote.midiNum) as MidiNumber,
  );
  const firstPosDistance = (freqToLength(firstPosNote.freq) -
    freqToLength(topSlideFreq)) as Meters;

  // modify tunings to account for first pos distance, while preserving name
  const newTunings = tunings.map(
    (tuning) =>
      new Tuning((tuning.length - firstPosDistance) as Meters, tuning.name),
  );

  // Get lip bend range
  const lipBendRange = (lipBendStartNote.freq - lipBendStopNote.freq) as Hertz;

  // Build model
  const trombone = new Trombone(newTunings, slideLength);
  const player = new Player(lipBendRange, firstPosDistance);

  return {
    title,
    notes,
    trombone,
    player,
  };
}
