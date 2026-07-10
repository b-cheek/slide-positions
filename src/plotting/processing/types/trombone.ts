import { Tuning } from "./tuning";
import type { Meters } from "./constants";
import { Player } from "./player";
import { Note } from "./note";
import { freqToLength } from "../utils/physics";

// TODO: vary default slide length depending on open freq
const DEFAULT_SLIDE_LENGTH = (freqToLength(Note.fromSciNotation("E1").freq) -
  freqToLength(Note.fromSciNotation("Bb1").freq)) as Meters;
const DEFAULT_TUNINGS = [Tuning.fromPitchClassOrPitch("Bb")];

export class Trombone {
  public readonly tunings: Tuning[];
  public readonly slideLength: Meters;

  public constructor(
    tunings: Tuning[] = DEFAULT_TUNINGS,
    slideLength: Meters = DEFAULT_SLIDE_LENGTH,
  ) {
    this.tunings = tunings;
    this.slideLength = slideLength;
  }

  // Perhaps I could unfreeze the trombone class, but I think this is cleaner for now
  public static tuneFromTrombone(player: Player, trombone: Trombone): Trombone {
    return new Trombone(
      trombone.tunings.map(
        (tuning) =>
          new Tuning(
            (tuning.length - player.firstPosDistance) as Meters,
            tuning.name,
          ),
      ),
      trombone.slideLength,
    );
  }
}
