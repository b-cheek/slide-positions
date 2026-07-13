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

  public getSlidePositionString(player: Player, trombone: Trombone): string {
    if (this.lipBendCents !== 0) return "All the way out";

    const formatNumber = (value: number, decimals = 2) =>
      (+value.toFixed(decimals)).toString();
    const position = formatNumber(this.getSlidePosition(player));
    if (this.tuning === trombone.tunings[0]) return position;

    const openPosition = formatNumber(this.getOpenPosition(player, trombone));
    return `${position}${this.tuning.name.split(" ")[0]} (${openPosition})`;
  }

  public get graphPoint(): [Meters, MidiNumber] {
    const fakeSlideDistance = ((this.tuning.length + this.slideDistance) *
      2 ** (this.lipBendCents / 1200) -
      this.tuning.length) as Meters;
    return [fakeSlideDistance, this.note.midiNum];
  }
}
