import { describe, expect, it } from "vitest";
import {
  evaluateIdealCase,
  findWeights,
  formatOptimizationResult,
  REFERENCE_WEIGHT_RANGES,
} from "./weightOptimization";
import { REFERENCE_WEIGHTS } from "../types/weights";

describe("weight optimization", () => {
  it("supports ideal cases with explicit trombone and player inputs", () => {
    expect(() =>
      findWeights(
        [
          {
            name: "single Bb3",
            inputs: {
              notesString: "Bb3",
              valvesString: "Bb",
            },
            expected: [
              {
                note: "Bb3",
                partial: 4,
                tuningName: "Bb tuning",
                slidePosition: 1,
              },
            ],
          },
        ],
        REFERENCE_WEIGHT_RANGES,
        { maxAttempts: 1 },
      ),
    ).not.toThrow();
  });

  it("reports configuration mismatches without treating them as structural", () => {
    const evaluation = evaluateIdealCase(
      {
        name: "wrong partial",
        inputs: { notesString: "Bb3", valvesString: "Bb" },
        expected: [{ note: "Bb3", partial: 5, tuningName: "Bb tuning" }],
      },
      REFERENCE_WEIGHTS,
    );

    expect(evaluation.exactMatch).toBe(false);
    expect(evaluation.score[0]).toBe(0);
    expect(evaluation.score[1]).toBe(1);
    expect(evaluation.mismatches[0]).toContain("partial/tuning");
  });

  it("uses the default tempo and supports per-case tempo", () => {
    const idealCase = {
      name: "tempo-aware case",
      inputs: { notesString: "Bb2-Bb3(Bb)" },
      expected: [],
    };
    const fasterIdealCase = { ...idealCase, tempo: 240 };

    const defaultEvaluation = evaluateIdealCase(idealCase, REFERENCE_WEIGHTS);
    const fasterEvaluation = evaluateIdealCase(
      fasterIdealCase,
      REFERENCE_WEIGHTS,
    );

    expect(defaultEvaluation).toEqual(
      evaluateIdealCase({ ...idealCase, tempo: 120 }, REFERENCE_WEIGHTS),
    );
    expect(fasterEvaluation).not.toEqual(defaultEvaluation);
  });

  it("returns the best candidate and diagnostics when strict mode is off", () => {
    const result = findWeights(
      [
        {
          name: "impossible output",
          inputs: { notesString: "Bb3", valvesString: "Bb" },
          expected: [{ note: "C4", partial: 1, tuningName: "Bb tuning" }],
        },
      ],
      REFERENCE_WEIGHT_RANGES,
      { maxAttempts: 2 },
    );

    expect(result.allCasesMatch).toBe(false);
    expect(formatOptimizationResult(result)).toContain("Best score");
  });

  it("throws the best diagnostics in strict mode", () => {
    expect(() =>
      findWeights(
        [
          {
            name: "impossible output",
            inputs: { notesString: "Bb3", valvesString: "Bb" },
            expected: [{ note: "C4", partial: 1, tuningName: "Bb tuning" }],
          },
        ],
        REFERENCE_WEIGHT_RANGES,
        { maxAttempts: 1, strict: true },
      ),
    ).toThrow(/Best score/);
  });
});
