import IDEAL_CASES from "../src/plotting/processing/utils/idealCases";
import {
  findWeights,
  formatOptimizationResult,
  recordWeights,
  REFERENCE_WEIGHT_RANGES,
  writeOptimizedWeights,
} from "../src/plotting/processing/utils/weightOptimization";

const result = findWeights(IDEAL_CASES, REFERENCE_WEIGHT_RANGES, {
  maxAttempts: 1_000_000,
});

console.info(
  `${result.allCasesMatch ? "Exact" : "Best-effort"} weights:\n` +
    `${recordWeights(result.weights)}\n` +
    `Score: ${result.score.join(", ")}\n` +
    (result.allCasesMatch ? "" : `${formatOptimizationResult(result)}\n`),
);

writeOptimizedWeights(result.weights);
