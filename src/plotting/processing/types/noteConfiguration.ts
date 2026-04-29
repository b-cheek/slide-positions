import type {
  AbsolutePosition,
  Cents,
  Meters,
  MidiNumber,
  RelativePosition,
} from "./constants";
import { Note } from "./note";
import { Tuning } from "./tuning";
import { Player } from "./player";
import { Trombone } from "./trombone";

export class NoteConfiguration {
  public readonly note: Note;
  public readonly tuning: Tuning;
  public readonly slideDistance: Meters;
  public readonly partial: number;
  public readonly lipBendCents: Cents; // Change to cents?

  public constructor(
    note: Note,
    tuning: Tuning,
    slideDistance: Meters,
    partial: number,
    lipBendCents: Cents,
  ) {
    this.note = note;
    this.tuning = tuning;
    this.slideDistance = slideDistance;
    this.partial = partial;
    this.lipBendCents = lipBendCents;
  }

  public getSlidePosition(player: Player): RelativePosition {
    // Not simplifying for readability
    return (Math.log2(
      (this.tuning.length + this.slideDistance) /
        (this.tuning.length + player.firstPosDistance),
    ) *
      12 +
      1) as RelativePosition;
  }

  public getOpenPosition(player: Player, trombone: Trombone): AbsolutePosition {
    const openLen = trombone.tunings[0].length;
    return (Math.log2(
      (openLen + this.slideDistance) / (openLen + player.firstPosDistance),
    ) *
      12 +
      1) as AbsolutePosition;
  }

  public get graphPoint(): [Meters, MidiNumber] {
    return [this.slideDistance, this.note.midiNum];
  }
}
