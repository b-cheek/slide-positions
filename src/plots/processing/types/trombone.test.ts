import { describe, expect, it } from "vitest";
import { Note } from "./note";
import { Player } from "./player";
import { Trombone } from "./trombone";

describe("Trombone.getNoteConfigs", () => {
  // Test defaults (Bb trombone 7 slide pos, no lip bend or first pos distance)
  it("Bb3 can be played in positions 1 and 4.86 on a Bb trombone", () => {
    const trombone = new Trombone();
    const player = new Player();
    const note = Note.fromSciNotation("Bb3");

    const relativePositions = trombone
      .getNoteConfigs(note, player)
      .map((config) => config.getSlidePosition(player));

    expect(relativePositions).toHaveLength(2);
    expect(relativePositions[0]).toBeCloseTo(1, 2);
    expect(relativePositions[1]).toBeCloseTo(4.86, 2);
  });

  // Inaccessible note
  (it("Eb2 can not be played on a Bb trombone"),
    () => {
      const trombone = new Trombone();
      const player = new Player();
      const note = Note.fromSciNotation("Eb2");

      const configs = trombone.getNoteConfigs(note, player);

      expect(configs).toHaveLength(0);
    });

  // Can play down to first partial after inaccessible gap
  (it("Bb1 can be played on a Bb trombone"),
    () => {
      const trombone = new Trombone();
      const player = new Player();
      const note = Note.fromSciNotation("Bb1");

      const configs = trombone.getNoteConfigs(note, player);

      expect(configs).toHaveLength(1);
      expect(configs[0].partial).toBe(1);
      expect(configs[0].slideDistance).toBeCloseTo(0, 2);
    });

  // Test notes that are technically out of range on the theoretical default trombone
  (it("B2 and D4 can not be played on default trombone"),
    () => {
      const trombone = new Trombone();
      const player = new Player();
      const b2 = Note.fromSciNotation("B2");
      const d4 = Note.fromSciNotation("D4");

      const b2Configs = trombone.getNoteConfigs(b2, player);
      const d4Configs = trombone.getNoteConfigs(d4, player);

      expect(b2Configs).toHaveLength(0);
      expect(d4Configs).toHaveLength(0);
    });
});
