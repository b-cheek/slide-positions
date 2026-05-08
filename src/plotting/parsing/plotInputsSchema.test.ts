import { describe, expect, it } from "vitest";
import { plotInputsSchema } from "./plotInputsSchema";

// TODO: Add tests for unit edge cases

describe("plotInputsSchema", () => {
  it("parses valid input", () => {
    const input = {
      notesString: "Bb1, C2, D2",
      valvesString: "Bb/F",
      topSlideNote: "Bb1",
      bottomSlideNote: "E1",
      lipBendStartNote: "Bb1",
      lipBendStopNote: "A1",
    };

    const result = plotInputsSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("applies defaults for optional inputs", () => {
    const result = plotInputsSchema.safeParse({
      notesString: "Bb1, C2, D2",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tunings).toHaveLength(2);
      expect(result.data.topSlideNote.name).toBe("Bb1");
      expect(result.data.bottomSlideNote.name).toBe("E1");
    }
  });

  it("treats blank optional inputs as missing", () => {
    const result = plotInputsSchema.safeParse({
      notesString: "Bb1, C2, D2",
      valvesString: "",
      topSlideNote: "",
      bottomSlideNote: "",
      lipBendStartNote: "",
      lipBendStopNote: "",
      title: "",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tunings).toHaveLength(2);
      expect(result.data.topSlideNote.name).toBe("Bb1");
      expect(result.data.bottomSlideNote.name).toBe("E1");
      expect(result.data.lipBendStartNote.name).toBe("Bb1");
      expect(result.data.lipBendStopNote.name).toBe("G1");
    }
  });

  it("rejects invalid input", () => {
    const result = plotInputsSchema.safeParse({
      notesString: "InvalidNote",
    });

    expect(result.success).toBe(false);
  });
});
