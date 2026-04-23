import { describe, expect, it } from "vitest";
import { Note } from "./note";
import { Player } from "./player";
import { Trombone } from "./trombone";
import { Tuning } from "./tuning";

describe("Trombone.getNoteConfigs", () => {
  // Test defaults (Bb trombone 7 slide pos, no lip bend or first pos distance)
  // Basic note with multiple positions
  it("Bb3 can be played in positions 1 and 4.86 on a Bb trombone", () => {
    const trombone = new Trombone();
    const player = new Player();
    const note = Note.fromSciNotation("Bb3");

    const relativePositions = trombone.getNoteConfigs(note, player);

    // Finds two configs
    expect(relativePositions).toHaveLength(2);
    const firstPosConfig = relativePositions[0];
    const fifthPosConfig = relativePositions[1];

    // Check slide distance on first pos
    expect(firstPosConfig.slideDistance).toBe(0);

    // Correct partials
    expect(firstPosConfig.partial).toBe(4);
    expect(fifthPosConfig.partial).toBe(5);

    // Correct positions
    expect(firstPosConfig.getSlidePosition(player)).toBe(1);
    expect(fifthPosConfig.getSlidePosition(player)).toBeCloseTo(4.86, 2);
  });

  // Inaccessible note
  it("Eb2 can not be played on a Bb trombone", () => {
    const trombone = new Trombone();
    const player = new Player();
    const note = Note.fromSciNotation("Eb2");

    const configs = trombone.getNoteConfigs(note, player);

    expect(configs).toHaveLength(0);
  });

  // Can play down to first partial after inaccessible gap
  it("Bb1 can be played on a Bb trombone", () => {
    const trombone = new Trombone();
    const player = new Player();
    const note = Note.fromSciNotation("Bb1");

    const configs = trombone.getNoteConfigs(note, player);

    expect(configs).toHaveLength(1);
    expect(configs[0].slideDistance).toBe(0);
    expect(configs[0].partial).toBe(1);
    expect(configs[0].getSlidePosition(player)).toBe(1);
  });

  // Test notes that are technically out of range on the theoretical default trombone
  it("B2 and D4 can not be played on default trombone", () => {
    const trombone = new Trombone();
    const player = new Player();
    const b2 = Note.fromSciNotation("B2");
    const d4 = Note.fromSciNotation("D4");

    const b2Configs = trombone.getNoteConfigs(b2, player);
    const d4Configs = trombone.getNoteConfigs(d4, player);

    expect(b2Configs).toHaveLength(0);
    // D4 can still be played in 4th and 7th pos
    expect(d4Configs).toHaveLength(2);

    // Check that none of the D4 configs are near first position
    d4Configs.forEach((config) => {
      expect(config.getSlidePosition(player)).toBeGreaterThan(2);
    });

    // Check that that the other positions are still present
    const fourthPosConfig = d4Configs[0];
    const seventhPosConfig = d4Configs[1];
    expect(fourthPosConfig.partial).toBe(6);
    expect(seventhPosConfig.partial).toBe(7);
    expect(fourthPosConfig.getSlidePosition(player)).toBeCloseTo(4.02, 2);
    expect(seventhPosConfig.getSlidePosition(player)).toBeCloseTo(6.69, 2);
  });

  // Test a different fundamental, Eb2 for alto trombone
  // Basic fundamental test
  it("Eb2 is in first position on an Eb alto trombone", () => {
    const ebTrombone = new Trombone([Tuning.fromPitchClassOrPitch("Eb2")]);
    const player = new Player();
    const note = Note.fromSciNotation("Eb2");

    const configs = ebTrombone.getNoteConfigs(note, player);

    expect(configs).toHaveLength(1);
    expect(configs[0].slideDistance).toBe(0);
    expect(configs[0].partial).toBe(1);
    expect(configs[0].getSlidePosition(player)).toBe(1);
  });

  // Test a different (2nd) position
  it("D2 can be played in 2nd position on an Eb alto trombone", () => {
    const ebTrombone = new Trombone([Tuning.fromPitchClassOrPitch("Eb2")]);
    const player = new Player();
    const note = Note.fromSciNotation("D2");

    const configs = ebTrombone.getNoteConfigs(note, player);

    expect(configs).toHaveLength(1);
    expect(configs[0].partial).toBe(1);
    expect(configs[0].getSlidePosition(player)).toBeCloseTo(2, 2);
  });

  // 2 tunings
  // Basic note
  it("C3 can be played in position 1.02 on a Bb/F trombone", () => {
    const trombone = new Trombone([
      Tuning.fromPitchClassOrPitch("Bb"),
      Tuning.fromPitchClassOrPitch("F"),
    ]);
    const player = new Player();
    const note = Note.fromSciNotation("C3");

    const configs = trombone.getNoteConfigs(note, player);

    expect(configs).toHaveLength(2);
    const sixthPosConfig = configs[0];
    const firstPosConfig = configs[1];

    expect(sixthPosConfig.partial).toBe(3);
    expect(firstPosConfig.partial).toBe(3);

    const relativeFirstPos = firstPosConfig.getSlidePosition(player);

    expect(sixthPosConfig.getSlidePosition(player)).toBeCloseTo(6.02, 2);
    expect(relativeFirstPos).toBeCloseTo(1.02, 2);

    // Check that open pos is slightly longer
    expect(relativeFirstPos).toBeLessThan(
      firstPosConfig.getOpenPosition(player, trombone),
    );
  });

  // note that was previously inaccessible
  it("B2 is accessible on a Bb/F trombone", () => {
    const trombone = new Trombone([
      Tuning.fromPitchClassOrPitch("Bb"),
      Tuning.fromPitchClassOrPitch("F"),
    ]);
    const player = new Player();
    const note = Note.fromSciNotation("B2");

    const configs = trombone.getNoteConfigs(note, player);
    expect(configs).toHaveLength(1);
    const config = configs[0];
    expect(config.partial).toBe(3);
    expect(config.getSlidePosition(player)).toBeCloseTo(2.02, 2);
  });

  // note that is still inacessible
  it("C2 is still inacessible on a Bb/F trombone", () => {
    const trombone = new Trombone([
      Tuning.fromPitchClassOrPitch("Bb"),
      Tuning.fromPitchClassOrPitch("F"),
    ]);
    const player = new Player();
    const note = Note.fromSciNotation("C2");

    const configs = trombone.getNoteConfigs(note, player);
    expect(configs).toHaveLength(0);
  });

  // TODO: test 3 tunings

  // TODO: test lip bend and first pos distance
});
