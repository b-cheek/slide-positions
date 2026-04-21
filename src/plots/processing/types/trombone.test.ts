import { describe, expect, it } from "vitest";
import { Note } from "./note";
import { Player } from "./player";
import { Trombone } from "./trombone";

describe("Trombone.getNoteConfigs", () => {
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
});
