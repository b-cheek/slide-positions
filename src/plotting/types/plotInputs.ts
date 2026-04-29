import type { Note } from "../processing/types/note";
import type { Tuning } from "../processing/types/tuning";

export type RawPlotInputs = {
  notesString: string; // Notes as user-entered string
  valvesString: string; // Tunings as user-entered string
  topSlideNote: string; // string note
  bottomSlideNote: string; // string note
  lipBendStartNote: string; // string note
  lipBendStopNote: string; // string note
};

export type ParsedPlotInputs = {
  notes: Note[];
  tunings: Tuning[];
  topSlideNote: Note;
  bottomSlideNote: Note;
  lipBendStartNote: Note;
  lipBendStopNote: Note;
  // Derived numeric values may be computed in processing as needed
};

export type PlotInputs = RawPlotInputs;
