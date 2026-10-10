import {
  plotInputsSchema,
  type RawPlotInputs,
} from "../../parsing/plotInputsSchema";
import { writeFileSync } from "node:fs";
import { buildPlotModel } from "../../parsing/utils";
import type { Weights } from "../types/weights";
import { getNoteConfigs, getViterbiSlidePath } from "./slideCalculation";

export type WeightRanges = {
  [K in keyof Weights]: { min: number; max: number };
};

export interface IdealOutput {
  note: string;
  partial: number;
  tuningName: string;
  slidePosition?: number;
}

export interface IdealCase {
  name: string;
  inputs: Pick<RawPlotInputs, "notesString"> &
    Partial<Omit<RawPlotInputs, "notesString">>;
  expected: IdealOutput[];
}

export type OptimizationScore = readonly [
  structuralMismatches: number,
  configurationMismatches: number,
  slidePositionError: number,
];

export interface IdealCaseEvaluation {
  caseName: string;
  score: OptimizationScore;
  exactMatch: boolean;
  actual: IdealOutput[];
  mismatches: string[];
}

export interface WeightOptimizationResult {
  weights: Weights;
  score: OptimizationScore;
  evaluations: IdealCaseEvaluation[];
  attempts: number;
  allCasesMatch: boolean;
}

export interface FindWeightsOptions {
  maxAttempts: number;
  strict?: boolean;
}

export const REFERENCE_WEIGHT_RANGES: WeightRanges = {
  lipBendCentsCost: { min: 0, max: 0.2 },
  slideDistanceCost: { min: 0, max: 1 },
  slideProportionCost: { min: 0, max: 2 },
  tuningCost: { min: 0, max: 2 },
  partialChangeCost: { min: 0, max: 0.5 },
  slideDistanceChangeCost: { min: 0, max: 3 },
  slideProportionChangeCost: { min: 0, max: 6 },
  directionChangeCost: { min: 0, max: 1 },
  velocityChangeCost: { min: 0, max: 2 },
  slideDistanceRangeRelativeCost: { min: 0, max: 0.05 },
  slideProportionRangeRelativeCost: { min: 0, max: 0.05 },
  tuningRangeRelativeCost: { min: 0, max: 0.15 },
};

function randomWeight(ranges: WeightRanges): Weights {
  const weights = {} as Weights;
  for (const key of Object.keys(ranges) as (keyof Weights)[]) {
    const range = ranges[key];
    weights[key] = range.min + Math.random() * (range.max - range.min);
  }
  return weights;
}

function compareScores(a: OptimizationScore, b: OptimizationScore): number {
  for (let index = 0; index < a.length; index++) {
    if (a[index] !== b[index]) return a[index] - b[index];
  }
  return 0;
}

export function evaluateIdealCase(
  idealCase: IdealCase,
  weights: Weights,
): IdealCaseEvaluation {
  const model = buildPlotModel(plotInputsSchema.parse(idealCase.inputs));
  const configs = model.notes.flatMap((note) =>
    getNoteConfigs(model.trombone, note, model.player),
  );
  const path = getViterbiSlidePath(
    configs,
    model.player,
    model.trombone,
    weights,
  );
  const actual = path.map((config) => ({
    note: config.note.name,
    partial: config.partial,
    tuningName: config.tuning.name,
    slidePosition: config.getSlidePosition(model.player),
  }));
  const mismatches: string[] = [];
  let structuralMismatches = Math.abs(
    actual.length - idealCase.expected.length,
  );
  let configurationMismatches = 0;
  let slidePositionError = 0;

  const sharedLength = Math.min(actual.length, idealCase.expected.length);
  for (let index = 0; index < sharedLength; index++) {
    const output = actual[index];
    const expected = idealCase.expected[index];
    if (output.note !== expected.note) {
      structuralMismatches++;
      mismatches.push(
        `position ${index + 1}: expected note ${expected.note}, got ${output.note}`,
      );
      continue;
    }
    if (
      output.partial !== expected.partial ||
      output.tuningName !== expected.tuningName
    ) {
      configurationMismatches++;
      mismatches.push(
        `position ${index + 1} (${output.note}): expected partial/tuning ` +
          `${expected.partial}/${expected.tuningName}, got ` +
          `${output.partial}/${output.tuningName}`,
      );
    }
    if (expected.slidePosition !== undefined) {
      const error = Math.abs(output.slidePosition - expected.slidePosition);
      slidePositionError += error;
      if (error >= 0.01) {
        mismatches.push(
          `position ${index + 1} (${output.note}): expected slide position ` +
            `${expected.slidePosition}, got ${output.slidePosition.toFixed(2)}`,
        );
      }
    }
  }

  const score: OptimizationScore = [
    structuralMismatches,
    configurationMismatches,
    slidePositionError,
  ];
  return {
    caseName: idealCase.name,
    score,
    exactMatch: compareScores(score, [0, 0, 0]) === 0,
    actual,
    mismatches,
  };
}

function evaluateWeights(
  idealCases: IdealCase[],
  weights: Weights,
  attempts: number,
): WeightOptimizationResult {
  const evaluations = idealCases.map((idealCase) =>
    evaluateIdealCase(idealCase, weights),
  );
  const score: OptimizationScore = evaluations.reduce(
    (total, evaluation) => [
      total[0] + evaluation.score[0],
      total[1] + evaluation.score[1],
      total[2] + evaluation.score[2],
    ],
    [0, 0, 0],
  );
  return {
    weights,
    score,
    evaluations,
    attempts,
    allCasesMatch: evaluations.every((evaluation) => evaluation.exactMatch),
  };
}

export function findWeights(
  idealCases: IdealCase[],
  ranges: WeightRanges,
  options: FindWeightsOptions,
): WeightOptimizationResult {
  let bestResult: WeightOptimizationResult | undefined;
  for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
    const weights = randomWeight(ranges);
    const result = evaluateWeights(idealCases, weights, attempt);
    if (!bestResult || compareScores(result.score, bestResult.score) < 0) {
      bestResult = result;
    }
    if (result.allCasesMatch) return result;
  }

  if (!bestResult) {
    throw new Error(`No weight candidates were evaluated.`);
  }
  if (options.strict) {
    throw new Error(formatOptimizationResult(bestResult));
  }
  return bestResult;
}

export function recordWeights(weights: Weights): string {
  return JSON.stringify(weights, null, 2);
}

export function writeOptimizedWeights(
  weights: Weights,
  path = "src/plotting/processing/utils/optimizedWeights.json",
): void {
  writeFileSync(path, `${recordWeights(weights)}\n`, "utf8");
}

export function formatOptimizationResult(
  result: WeightOptimizationResult,
): string {
  const diagnostics = result.evaluations
    .filter((evaluation) => !evaluation.exactMatch)
    .map((evaluation) => {
      const details =
        evaluation.mismatches.join("; ") || "no detailed mismatch";
      return `${evaluation.caseName} [score ${evaluation.score.join(", ")}]: ${details}`;
    })
    .join("\n");
  return (
    `No exact weights found in ${result.attempts} attempts. ` +
    `Best score: ${result.score.join(", ")}.\n${diagnostics}`
  );
}
