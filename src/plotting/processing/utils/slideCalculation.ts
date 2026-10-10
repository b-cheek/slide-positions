import { NoteConfiguration } from "../types/noteConfiguration";
import { Player } from "../types/player";
import { freqToLength, lengthToFreq } from "./physics";
import { Trombone } from "../types/trombone";
import { Meters, Hertz, Cents } from "../types/constants";
import { Note } from "../types/note";
import type { Weights } from "../types/weights";

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
  weights: Weights,
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

  // Cost functions
  const emissionCost = (
    cfg: NoteConfiguration,
    tb: Trombone,
    pathWeights: Weights,
  ) => {
    const lipBendPenalty = Math.abs(cfg.lipBendCents);
    const tuningIndex = tb.tunings.indexOf(cfg.tuning);
    return (
      lipBendPenalty * pathWeights.lipBendCentsCost +
      cfg.slideDistance *
        pathWeights.slideDistanceCost *
        pathWeights.slideDistanceRangeRelativeCost *
        cfg.note.midiNum +
      (cfg.slideDistance / tb.slideLength) *
        pathWeights.slideProportionCost *
        pathWeights.slideProportionRangeRelativeCost *
        cfg.note.midiNum +
      tuningIndex *
        pathWeights.tuningCost *
        pathWeights.tuningRangeRelativeCost *
        cfg.note.midiNum
    );
  };

  const transitionCost = (
    from: NoteConfiguration,
    to: NoteConfiguration,
    pathWeights: Weights,
    prevFrom?: NoteConfiguration,
  ) => {
    const slideDelta = Math.abs(to.slideDistance - from.slideDistance);
    const partialDelta = Math.abs(to.partial - from.partial);

    // Calculate direction change penalty if we have a 3-state chain
    let directionPenalty = 0;
    let velocityDelta = 0;
    if (prevFrom) {
      const delta1 = from.slideDistance - prevFrom.slideDistance; // Velocity vector of step t-1
      const delta2 = to.slideDistance - from.slideDistance; // Velocity vector of step t
      velocityDelta = Math.abs(delta2 - delta1);

      // If signs are opposite (e.g., out-then-in or in-then-out), product is negative
      if (delta1 * delta2 < 0) {
        directionPenalty = pathWeights.directionChangeCost;
      }
    }

    return (
      slideDelta * pathWeights.slideDistanceChangeCost +
      Math.abs(
        to.slideDistance / trombone.slideLength -
          from.slideDistance / trombone.slideLength,
      ) *
        pathWeights.slideProportionChangeCost +
      partialDelta * pathWeights.partialChangeCost +
      velocityDelta * pathWeights.velocityChangeCost +
      directionPenalty
    );
  };

  // Edge case: Only 1 note group (no transitions possible)
  if (groups.length === 1) {
    return [
      groups[0].reduce((best, cur) =>
        emissionCost(cur, trombone, weights) <
        emissionCost(best, trombone, weights)
          ? cur
          : best,
      ),
    ];
  }

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
    const eCost0 = emissionCost(groups[0][i], trombone, weights);

    for (let j = 0; j < groups[1].length; j++) {
      const eCost1 = emissionCost(groups[1][j], trombone, weights);
      // No direction change is possible on the first transition, so omit prevFrom.
      dp[1][i][j] =
        eCost0 + transitionCost(groups[0][i], groups[1][j], weights) + eCost1;
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
        const eCost = emissionCost(toCfg, trombone, weights);

        // Test all possible preceding states 'k' from step t-2
        for (let k = 0; k < groups[t - 2].length; k++) {
          const prevFromCfg = groups[t - 2][k];
          const cost =
            dp[t - 1][k][i] +
            transitionCost(fromCfg, toCfg, weights, prevFromCfg) +
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
