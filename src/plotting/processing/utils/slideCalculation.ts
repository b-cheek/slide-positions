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

export function getViterbiSlidePath(
  noteConfigs: NoteConfiguration[],
  player: Player,
  trombone: Trombone,
): NoteConfiguration[] {
  // Group contiguous configs by the note occurrence order (flatMap preserves order)
  const groups: NoteConfiguration[][] = [];
  for (const cfg of noteConfigs) {
    const lastGroup = groups[groups.length - 1];
    if (!lastGroup || lastGroup[0].note !== cfg.note) {
      groups.push([cfg]);
    } else {
      lastGroup.push(cfg);
    }
  }

  if (groups.length === 0) return [];

  // Cost functions
  const emissionCost = (cfg: NoteConfiguration) => {
    // Prefer configurations with no lip bend and shorter slide distances.
    const lipBendPenalty = Math.abs(cfg.lipBendCents) / 100; // cents -> scaled penalty
    const slideNorm =
      Number(cfg.slideDistance) / Number(trombone.slideLength || 1);
    const slidePenalty = slideNorm; // linear penalty for further slides
    return lipBendPenalty * 1.0 + slidePenalty * 1.0;
  };

  const transitionCost = (from: NoteConfiguration, to: NoteConfiguration) => {
    // Penalize large jumps in slide position (in relative positions)
    const fromPos = from.getSlidePosition(player);
    const toPos = to.getSlidePosition(player);
    const posDelta = Math.abs(Number(toPos) - Number(fromPos));

    // Penalize changes in partials (prefer smoother partial transitions)
    const partialDelta = Math.abs(to.partial - from.partial);

    return posDelta * 1.0 + partialDelta * 0.5;
  };

  // Viterbi DP
  // dp[t][j] = best cost ending at group t, choice j
  const dp: number[][] = [];
  const backpointer: number[][] = [];

  // initialize
  dp[0] = groups[0].map((cfg) => emissionCost(cfg));
  backpointer[0] = groups[0].map(() => -1);

  for (let t = 1; t < groups.length; t++) {
    dp[t] = new Array(groups[t].length).fill(Infinity);
    backpointer[t] = new Array(groups[t].length).fill(-1);

    for (let j = 0; j < groups[t].length; j++) {
      const toCfg = groups[t][j];
      const eCost = emissionCost(toCfg);

      for (let i = 0; i < groups[t - 1].length; i++) {
        const fromCfg = groups[t - 1][i];
        const cost = dp[t - 1][i] + transitionCost(fromCfg, toCfg) + eCost;
        if (cost < dp[t][j]) {
          dp[t][j] = cost;
          backpointer[t][j] = i;
        }
      }
    }
  }

  // find best last
  const last = groups.length - 1;
  let bestIdx = 0;
  let bestCost = dp[last][0];
  for (let j = 1; j < dp[last].length; j++) {
    if (dp[last][j] < bestCost) {
      bestCost = dp[last][j];
      bestIdx = j;
    }
  }

  // backtrack
  const path: NoteConfiguration[] = [];
  let curIdx = bestIdx;
  for (let t = last; t >= 0; t--) {
    path.unshift(groups[t][curIdx]);
    curIdx = backpointer[t][curIdx];
    if (curIdx === -1) break;
  }

  return path;
}
