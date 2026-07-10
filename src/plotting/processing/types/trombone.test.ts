import { describe, expect, it } from "vitest";
import { Player } from "./player";
import { Trombone } from "./trombone";
import { Hertz, Meters } from "../..";

describe("Trombone.tuneFromTrombone", () => {
  it("adjusts tunings based on player first pos distance", () => {
    const firstPosDistance = 0.001 as Meters;
    const player = new Player(0 as Hertz, firstPosDistance);
    const originalTrombone = new Trombone();

    const tunedTrombone = Trombone.tuneFromTrombone(player, originalTrombone);

    expect(tunedTrombone.tunings).toHaveLength(1);
    expect(tunedTrombone.tunings[0].length).toBeCloseTo(
      (originalTrombone.tunings[0].length - firstPosDistance) as Meters,
      10,
    );
    expect(tunedTrombone.tunings[0].name).toBe(
      originalTrombone.tunings[0].name,
    );
    // Check that slide length is unchanged
    expect(tunedTrombone.slideLength).toBe(originalTrombone.slideLength);
  });

  // Test that a first pos distance of 0 does not change the tunings
  it("does not change tunings if player has no first pos distance", () => {
    const player = new Player(0 as Hertz, 0 as Meters);
    const originalTrombone = new Trombone();

    const tunedTrombone = Trombone.tuneFromTrombone(player, originalTrombone);

    expect(tunedTrombone.tunings).toHaveLength(1);
    expect(tunedTrombone.tunings[0].length).toBeCloseTo(
      originalTrombone.tunings[0].length,
      10,
    );
    expect(tunedTrombone.tunings[0].name).toBe(
      originalTrombone.tunings[0].name,
    );
    // Check that slide length is unchanged
    expect(tunedTrombone.slideLength).toBe(originalTrombone.slideLength);
  });
});
