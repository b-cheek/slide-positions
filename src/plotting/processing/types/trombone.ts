import { Tuning } from "./tuning";
import type { Cents, Hertz, Meters } from "./constants";
import { Player } from "./player";
import { Note } from "./note";
import { NoteConfiguration } from "./noteConfiguration";
import { freqToLength, lengthToFreq } from "../utils/physics";

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

  public getNoteConfigs(note: Note, player: Player): NoteConfiguration[] {
    return this.tunings.flatMap((tuning) => {
      const minFreq = lengthToFreq(
        (tuning.length + this.slideLength) as Meters,
      );
      const maxFreq = lengthToFreq(tuning.length);
      const minPartial = Math.ceil(note.freq / maxFreq);
      const maxPartial = Math.ceil((note.freq + player.lipBendRange) / minFreq);

      if (maxPartial < minPartial) {
        return [];
      }

      const partials = Array.from(
        { length: maxPartial - minPartial + 1 },
        (_, i) => i + minPartial,
      );

      return partials.flatMap((partial) => {
        const targetFundamental = (note.freq / partial) as Hertz;
        const requiredSlideDistance = (freqToLength(targetFundamental) -
          tuning.length) as Meters;

        if (requiredSlideDistance <= this.slideLength) {
          return [
            new NoteConfiguration(
              note,
              tuning,
              requiredSlideDistance,
              partial,
              0 as Cents,
            ),
          ];
        }

        const maxSlideFundamental = lengthToFreq(
          (tuning.length + this.slideLength) as Meters,
        );
        const maxSlideNoteFreq = (maxSlideFundamental * partial) as Hertz;
        const requiredLipBendHz = (maxSlideNoteFreq - note.freq) as Hertz;

        if (requiredLipBendHz > player.lipBendRange) {
          return [];
        }

        const lipBendCents = (1200 *
          Math.log2(maxSlideNoteFreq / note.freq)) as Cents;
        return [
          new NoteConfiguration(
            note,
            tuning,
            this.slideLength,
            partial,
            lipBendCents,
          ),
        ];
      });
    });
  }
}
