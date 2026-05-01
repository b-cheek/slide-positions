import type { Note } from "../processing/types/note";
import type { Trombone } from "../processing/types/trombone";
import type { Player } from "../processing/types/player";

export type PlotModel = {
  title: string;
  notes: Note[];
  trombone: Trombone;
  player: Player;
};
