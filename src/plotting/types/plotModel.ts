import type { Note } from "../processing/types/note";
import type { Trombone } from "../processing/types/trombone";
import type { Player } from "../processing/types/player";
import type { NoteConfiguration } from "../processing/types/noteConfiguration";

export type NoteConfigLight = {
  noteName: string;
  midiNum: number;
  slideDistance: number;
  tuningIndex?: number;
  meta?: Record<string, unknown>;
};

export type PlotModel = {
  title: string;
  notes: Note[];
  trombone: Trombone;
  player: Player;
  noteConfigs: NoteConfigLight[];
  // Full runtime objects when consumer needs access to methods or extra fields
  rawNoteConfigs?: NoteConfiguration[];
  points: Array<{ x: number; y: number }>;
};
