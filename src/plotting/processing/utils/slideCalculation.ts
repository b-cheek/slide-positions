import { NoteConfiguration } from "../types/noteConfiguration";
import { Player } from "../types/player";
import { freqToLength, lengthToFreq } from "./physics";
import { Trombone } from "../types/trombone";
import { Meters, Hertz, Cents } from "../types/constants";
import { Note } from "../types/note";

export function getNoteConfigs(
  trombone: Trombone,
  note: Note,
  player: Player,
): NoteConfiguration[] {
  return (
    trombone.tunings
      .flatMap((tuning) => {
        const minFreq = lengthToFreq(
          (tuning.length + trombone.slideLength) as Meters,
        );
        const maxFreq = lengthToFreq(tuning.length);
        const minPartial = Math.ceil(note.freq / maxFreq);
        const maxPartial = Math.floor(
          (note.freq + player.lipBendRange) / minFreq,
        );

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

          if (requiredSlideDistance <= trombone.slideLength) {
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
            (tuning.length + trombone.slideLength) as Meters,
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
              trombone.slideLength,
              partial,
              lipBendCents,
            ),
          ];
        });
      })
      // Remove lip bent notes that can be played without a lip bend, or played with a shorter lip bend
      .filter((config, idx, arr) => {
        return (
          config.lipBendCents === 0 ||
          // Check that there isn't another config for the same note with no lip bend or simpler lip bend
          !arr.some((otherConfig, otherIdx) => {
            return (
              otherIdx !== idx && // Check that isn't the same config being tested
              // equal lip bend cents > 0 will not happen unless two of same tuning
              otherConfig.lipBendCents < config.lipBendCents && // Check that other config doesn't have a simpler or no lip bend
              otherConfig.note === config.note
            );
          })
        );
      })
  );
}
