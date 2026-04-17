import { describe, expect, it } from "vitest";
import { plotInputsSchema } from "./plotInputsSchema";

// TODO: Add tests for unit edge cases

describe("plotInputsSchema", () => {
  it("accepts a valid positive integer", () => {
    const result = plotInputsSchema.safeParse({ points: 12 });
    expect(result.success).toBe(true);
  });

  it("rejects zero and negatives", () => {
    const zero = plotInputsSchema.safeParse({ points: 0 });
    const negative = plotInputsSchema.safeParse({ points: -2 });

    expect(zero.success).toBe(false);
    expect(negative.success).toBe(false);
  });

  it("rejects non-integers", () => {
    const result = plotInputsSchema.safeParse({ points: 1.5 });
    expect(result.success).toBe(false);
  });
});
