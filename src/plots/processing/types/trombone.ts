import { Tuning } from "./tuning";
import type { Cents, Hertz, Meters } from "./constants";
import { Player } from "./player";
import { Note } from "./note";
import { NoteConfiguration } from "./noteConfiguration";
import { freqToLength, lengthToFreq } from "../utils";

const DEFAULT_SLIDE_LENGTH = (freqToLength(Note.fromSciNotation("E1").freq) -
  freqToLength(Note.fromSciNotation("Bb1").freq)) as Meters;
const DEFAULT_TUNINGS = [Tuning.fromPitchClass("Bb")];

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

  public getNoteConfigs(note: Note, player: Player): NoteConfiguration[] {
    return this.tunings.flatMap((tuning) => {
      // Flat map allows us to filter out bad configs as we go
      // by returning [] which is flattened out of the result
      const openFundamental = lengthToFreq(tuning.length);
      const partial = Math.ceil(note.freq / openFundamental);

      const targetFundamental = (note.freq / partial) as Hertz;
      const requiredSlideDistance = (freqToLength(targetFundamental) -
        tuning.length) as Meters;

      if (requiredSlideDistance <= this.slideLength) {
        return [
          new NoteConfiguration(
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
        new NoteConfiguration(tuning, this.slideLength, partial, lipBendCents),
      ];
    });
  }
}
