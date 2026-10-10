import { describe, expect, it } from "vitest";
import {
  evaluateIdealCase,
  findWeights,
  formatOptimizationResult,
  REFERENCE_WEIGHT_RANGES,
  recordWeights,
  writeOptimizedWeights,
} from "./weightOptimization";
import { REFERENCE_WEIGHTS } from "../types/weights";
import IDEAL_CASES from "./idealCases";

describe("weight optimization", () => {
  it("finds and records the best candidate for the editable ideal cases", () => {
    const result = findWeights(IDEAL_CASES, REFERENCE_WEIGHT_RANGES, {
      maxAttempts: 100_000,
    });
    console.info(
      `${result.allCasesMatch ? "Exact" : "Best-effort"} weights:\n` +
        `${recordWeights(result.weights)}\n` +
        `Score: ${result.score.join(", ")}\n` +
        result.evaluations
          .filter((evaluation) => !evaluation.exactMatch)
          .map(
            (evaluation) =>
              `${evaluation.caseName}: ${evaluation.mismatches.join("; ")}`,
          )
          .join("\n"),
    );
    writeOptimizedWeights(result.weights);
    expect(result.weights).toBeDefined();
  }, 60_000);

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
