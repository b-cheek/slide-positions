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

// emission cost weights
const LIP_BEND_CENTS_COST = 0.01;
const SLIDE_DISTANCE_COST = 1.0;
const TUNING_COST = 0.1;

// transition cost weights
const PARTIAL_CHANGE_COST = 0.5;
const POS_CHANGE_COST = 1.0;
const DIRECTION_CHANGE_COST = 0.5;

export function getViterbiSlidePath(
  noteConfigs: NoteConfiguration[],
  player: Player,
  trombone: Trombone,
): NoteConfiguration[] {
  // Group contiguous configs by note occurrence order
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

  // Edge case: Only 1 note group (no transitions possible)
  if (groups.length === 1) {
    return [
      groups[0].reduce((best, cur) =>
        emissionCost(cur, trombone) < emissionCost(best, trombone) ? cur : best,
      ),
    ];
  }

  // Cost functions
  const emissionCost = (cfg: NoteConfiguration, tb: Trombone) => {
    const lipBendPenalty = Math.abs(cfg.lipBendCents);
    const slideNorm = Number(cfg.slideDistance) / Number(tb.slideLength);
    const tuningIndex = tb.tunings.indexOf(cfg.tuning);
    return (
      lipBendPenalty * LIP_BEND_CENTS_COST +
      slideNorm * SLIDE_DISTANCE_COST +
      tuningIndex * TUNING_COST
    );
  };

  const transitionCost = (
    from: NoteConfiguration,
    to: NoteConfiguration,
    prevFrom?: NoteConfiguration,
  ) => {
    const fromPos = Number(from.getSlidePosition(player));
    const toPos = Number(to.getSlidePosition(player));
    const posDelta = Math.abs(toPos - fromPos);
    const partialDelta = Math.abs(to.partial - from.partial);

    // Calculate direction change penalty if we have a 3-state chain
    let directionPenalty = 0;
    if (prevFrom) {
      const prevPos = Number(prevFrom.getSlidePosition(player));
      const delta1 = fromPos - prevPos; // Velocity vector of step t-1
      const delta2 = toPos - fromPos; // Velocity vector of step t

      // If signs are opposite (e.g., out-then-in or in-then-out), product is negative
      if (delta1 * delta2 < 0) {
        directionPenalty = DIRECTION_CHANGE_COST;
      }
    }

    return (
      posDelta * POS_CHANGE_COST +
      partialDelta * PARTIAL_CHANGE_COST +
      directionPenalty
    );
  };

  // 2nd-Order Viterbi DP Tables
  // dp[t][i][j] = min cost ending at groups[t-1][i] -> groups[t][j]
  // backpointer[t][i][j] = winning index 'k' in groups[t-2]
  const dp: number[][][] = [];
  const backpointer: number[][][] = [];

  // Step 1: Initialize base transitions between group 0 and group 1
  dp[1] = [];
  backpointer[1] = [];
  for (let i = 0; i < groups[0].length; i++) {
    dp[1][i] = [];
    backpointer[1][i] = [];
    const eCost0 = emissionCost(groups[0][i], trombone);

    for (let j = 0; j < groups[1].length; j++) {
      const eCost1 = emissionCost(groups[1][j], trombone);
      // No direction change possible on the very first transition
      dp[1][i][j] =
        eCost0 + transitionCost(groups[0][i], groups[1][j]) + eCost1;
      backpointer[1][i][j] = -1;
    }
  }

  // Step 2: Fill DP table for groups 2 through N
  for (let t = 2; t < groups.length; t++) {
    dp[t] = [];
    backpointer[t] = [];

    for (let i = 0; i < groups[t - 1].length; i++) {
      dp[t][i] = new Array(groups[t].length).fill(Infinity);
      backpointer[t][i] = new Array(groups[t].length).fill(-1);

      const fromCfg = groups[t - 1][i];

      for (let j = 0; j < groups[t].length; j++) {
        const toCfg = groups[t][j];
        const eCost = emissionCost(toCfg, trombone);

        // Test all possible preceding states 'k' from step t-2
        for (let k = 0; k < groups[t - 2].length; k++) {
          const prevFromCfg = groups[t - 2][k];
          const cost =
            dp[t - 1][k][i] +
            transitionCost(fromCfg, toCfg, prevFromCfg) +
            eCost;

          if (cost < dp[t][i][j]) {
            dp[t][i][j] = cost;
            backpointer[t][i][j] = k;
          }
        }
      }
    }
  }

  // Step 3: Find best optimal ending pair (bestI, bestJ) at the last step
  const last = groups.length - 1;
  let bestCost = Infinity;
  let bestI = 0;
  let bestJ = 0;

  for (let i = 0; i < groups[last - 1].length; i++) {
    for (let j = 0; j < groups[last].length; j++) {
      if (dp[last][i][j] < bestCost) {
        bestCost = dp[last][i][j];
        bestI = i;
        bestJ = j;
      }
    }
  }

  // Step 4: Backtrack efficiently without unshift()
  const path: NoteConfiguration[] = new Array(groups.length);
  path[last] = groups[last][bestJ];
  path[last - 1] = groups[last - 1][bestI];

  let curI = bestI;
  let curJ = bestJ;

  for (let t = last; t >= 2; t--) {
    const prevK = backpointer[t][curI][curJ];
    path[t - 2] = groups[t - 2][prevK];
    // Step backward: what was 'from' (curI) is now 'to' (curJ)
    curJ = curI;
    curI = prevK;
  }

  return path;
}
