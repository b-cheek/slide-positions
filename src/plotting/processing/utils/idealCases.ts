import type { IdealCase } from "./weightOptimization";

const IDEAL_CASES: IdealCase[] = [
  {
    name: "Bb/F F2-F3(F)",
    inputs: {
      notesString: "F2-F3(F)",
      valvesString: "Bb/F",
    },
    expected: [
      { note: "F2", partial: 2, tuningName: "Bb tuning" },
      { note: "G2", partial: 2, tuningName: "Bb tuning" },
      { note: "A2", partial: 2, tuningName: "Bb tuning" },
      { note: "Bb2", partial: 2, tuningName: "Bb tuning" },
      { note: "C3", partial: 3, tuningName: "F tuning" },
      { note: "D3", partial: 3, tuningName: "Bb tuning" },
      { note: "E3", partial: 3, tuningName: "Bb tuning" },
      { note: "F3", partial: 3, tuningName: "Bb tuning" },
    ],
  },
  {
    name: "Bb/F Gb2-Gb3(Gb)",
    inputs: {
      notesString: "Gb2-Gb3(Gb)",
      valvesString: "Bb/F",
    },
    expected: [
      { note: "Gb2", partial: 2, tuningName: "Bb tuning" },
      { note: "Ab2", partial: 2, tuningName: "Bb tuning" },
      { note: "Bb2", partial: 2, tuningName: "Bb tuning" },
      { note: "B2", partial: 3, tuningName: "F tuning" },
      { note: "Db3", partial: 3, tuningName: "Bb tuning" },
      { note: "Eb3", partial: 3, tuningName: "Bb tuning" },
      { note: "F3", partial: 4, tuningName: "Bb tuning" },
      { note: "Gb3", partial: 4, tuningName: "Bb tuning" },
    ],
  },
  {
    name: "Bb/F G2-G3(G)",
    inputs: {
      notesString: "G2-G3(G)",
      valvesString: "Bb/F",
    },
    expected: [
      { note: "G2", partial: 2, tuningName: "Bb tuning" },
      { note: "A2", partial: 2, tuningName: "Bb tuning" },
      { note: "B2", partial: 3, tuningName: "F tuning" },
      { note: "C3", partial: 3, tuningName: "F tuning" },
      { note: "D3", partial: 3, tuningName: "Bb tuning" },
      { note: "E3", partial: 3, tuningName: "Bb tuning" },
      { note: "Gb3", partial: 4, tuningName: "Bb tuning" },
      { note: "G3", partial: 4, tuningName: "Bb tuning" },
    ],
  },
  {
    name: "Bb/F Ab2-Ab3(Ab)",
    inputs: {
      notesString: "Ab2-Ab3(Ab)",
      valvesString: "Bb/F",
    },
    expected: [
      { note: "Ab2", partial: 2, tuningName: "Bb tuning" },
      { note: "Bb2", partial: 3, tuningName: "F tuning" },
      { note: "C3", partial: 3, tuningName: "Bb tuning" },
      { note: "Db3", partial: 3, tuningName: "Bb tuning" },
      { note: "Eb3", partial: 3, tuningName: "Bb tuning" },
      { note: "F3", partial: 3, tuningName: "Bb tuning" },
      { note: "G3", partial: 4, tuningName: "Bb tuning" },
      { note: "Ab3", partial: 4, tuningName: "Bb tuning" },
    ],
  },
  {
    name: "Bb/F A2-A3(A)",
    inputs: {
      notesString: "A2-A3(A)",
      valvesString: "Bb/F",
    },
    expected: [
      { note: "A2", partial: 2, tuningName: "Bb tuning" },
      { note: "B2", partial: 3, tuningName: "F tuning" },
      { note: "Db3", partial: 3, tuningName: "Bb tuning" },
      { note: "D3", partial: 3, tuningName: "Bb tuning" },
      { note: "E3", partial: 3, tuningName: "Bb tuning" },
      { note: "Gb3", partial: 4, tuningName: "Bb tuning" },
      { note: "Ab3", partial: 4, tuningName: "Bb tuning" },
      { note: "A3", partial: 4, tuningName: "Bb tuning" },
    ],
  },
  {
    name: "Bb/F Bb2-Bb3(Bb)",
    inputs: {
      notesString: "Bb2-Bb3(Bb)",
      valvesString: "Bb/F",
    },
    expected: [
      { note: "Bb2", partial: 2, tuningName: "Bb tuning" },
      { note: "C3", partial: 3, tuningName: "F tuning" },
      { note: "D3", partial: 3, tuningName: "Bb tuning" },
      { note: "Eb3", partial: 3, tuningName: "Bb tuning" },
      { note: "F3", partial: 3, tuningName: "Bb tuning" },
      { note: "G3", partial: 4, tuningName: "Bb tuning" },
      { note: "A3", partial: 4, tuningName: "Bb tuning" },
      { note: "Bb3", partial: 4, tuningName: "Bb tuning" },
    ],
  },
  {
    name: "Bb/F F3-F4(F)",
    inputs: {
      notesString: "F3-F4(F)",
      valvesString: "Bb/F",
    },
    expected: [
      { note: "F3", partial: 3, tuningName: "Bb tuning" },
      { note: "G3", partial: 4, tuningName: "Bb tuning" },
      { note: "A3", partial: 4, tuningName: "Bb tuning" },
      { note: "Bb3", partial: 4, tuningName: "Bb tuning" },
      { note: "C4", partial: 5, tuningName: "Bb tuning" },
      { note: "D4", partial: 5, tuningName: "Bb tuning" },
      { note: "E4", partial: 6, tuningName: "Bb tuning" },
      { note: "F4", partial: 6, tuningName: "Bb tuning" },
    ],
  },
  {
    name: "Bb/F Bb3-Bb4(Bb)",
    inputs: {
      notesString: "Bb3-Bb4(Bb)",
      valvesString: "Bb/F",
    },
    expected: [
      { note: "Bb3", partial: 4, tuningName: "Bb tuning" },
      { note: "C4", partial: 5, tuningName: "Bb tuning" },
      { note: "D4", partial: 6, tuningName: "Bb tuning" },
      { note: "Eb4", partial: 6, tuningName: "Bb tuning" },
      { note: "F4", partial: 6, tuningName: "Bb tuning" },
      { note: "G4", partial: 7, tuningName: "Bb tuning" },
      { note: "A4", partial: 8, tuningName: "Bb tuning" },
      { note: "Bb4", partial: 8, tuningName: "Bb tuning" },
    ],
  },
];
export default IDEAL_CASES;
