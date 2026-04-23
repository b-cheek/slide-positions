import { describe, expect, it } from "vitest";
import { Note } from "./note";
import { Player } from "./player";
import { Trombone } from "./trombone";
import { Tuning } from "./tuning";
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

describe("Trombone.getNoteConfigs", () => {
  // Test defaults (Bb trombone 7 slide pos, no lip bend or first pos distance)
  const defaultTrombone = new Trombone();
  const defaultPlayer = new Player();
  // Basic note with multiple positions
  it("Bb3 can be played in positions 1 and 4.86 on a Bb trombone", () => {
    const note = Note.fromSciNotation("Bb3");

    const relativePositions = defaultTrombone.getNoteConfigs(
      note,
      defaultPlayer,
    );

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
    expect(firstPosConfig.getSlidePosition(defaultPlayer)).toBe(1);
    expect(fifthPosConfig.getSlidePosition(defaultPlayer)).toBeCloseTo(4.86, 2);
  });

  // Inaccessible note
  it("Eb2 can not be played on a Bb trombone", () => {
    const note = Note.fromSciNotation("Eb2");

    const configs = defaultTrombone.getNoteConfigs(note, defaultPlayer);

    expect(configs).toHaveLength(0);
  });

  // Can play down to first partial after inaccessible gap
  it("Bb1 can be played on a Bb trombone", () => {
    const note = Note.fromSciNotation("Bb1");

    const configs = defaultTrombone.getNoteConfigs(note, defaultPlayer);

    expect(configs).toHaveLength(1);
    expect(configs[0].slideDistance).toBe(0);
    expect(configs[0].partial).toBe(1);
    expect(configs[0].getSlidePosition(defaultPlayer)).toBe(1);
  });

  // Test notes that are technically out of range on the theoretical default trombone
  it("B2 and D4 can not be played on default trombone", () => {
    const b2 = Note.fromSciNotation("B2");
    const d4 = Note.fromSciNotation("D4");

    const b2Configs = defaultTrombone.getNoteConfigs(b2, defaultPlayer);
    const d4Configs = defaultTrombone.getNoteConfigs(d4, defaultPlayer);

    expect(b2Configs).toHaveLength(0);
    // D4 can still be played in 4th and 7th pos
    expect(d4Configs).toHaveLength(2);

    // Check that none of the D4 configs are near first position
    d4Configs.forEach((config) => {
      expect(config.getSlidePosition(defaultPlayer)).toBeGreaterThan(2);
    });

    // Check that that the other positions are still present
    const fourthPosConfig = d4Configs[0];
    const seventhPosConfig = d4Configs[1];
    expect(fourthPosConfig.partial).toBe(6);
    expect(seventhPosConfig.partial).toBe(7);
    expect(fourthPosConfig.getSlidePosition(defaultPlayer)).toBeCloseTo(
      4.02,
      2,
    );
    expect(seventhPosConfig.getSlidePosition(defaultPlayer)).toBeCloseTo(
      6.69,
      2,
    );
  });

  // Test a different fundamental, Eb2 for alto trombone
  // Basic fundamental test
  it("Eb2 is in first position on an Eb alto trombone", () => {
    const ebTrombone = new Trombone([Tuning.fromPitchClassOrPitch("Eb2")]);
    const note = Note.fromSciNotation("Eb2");

    const configs = ebTrombone.getNoteConfigs(note, defaultPlayer);

    expect(configs).toHaveLength(1);
    expect(configs[0].slideDistance).toBe(0);
    expect(configs[0].partial).toBe(1);
    expect(configs[0].getSlidePosition(defaultPlayer)).toBe(1);
  });

  // Test a different (2nd) position
  it("D2 can be played in 2nd position on an Eb alto trombone", () => {
    const ebTrombone = new Trombone([Tuning.fromPitchClassOrPitch("Eb2")]);
    const note = Note.fromSciNotation("D2");

    const configs = ebTrombone.getNoteConfigs(note, defaultPlayer);

    expect(configs).toHaveLength(1);
    expect(configs[0].partial).toBe(1);
    expect(configs[0].getSlidePosition(defaultPlayer)).toBeCloseTo(2, 2);
  });

  // 2 tunings
  const tromboneBbF = new Trombone([
    Tuning.fromPitchClassOrPitch("Bb"),
    Tuning.fromPitchClassOrPitch("F"),
  ]);
  // Basic note
  it("C3 can be played in position 1.02 on a Bb/F trombone", () => {
    const note = Note.fromSciNotation("C3");

    const configs = tromboneBbF.getNoteConfigs(note, defaultPlayer);

    expect(configs).toHaveLength(2);
    const sixthPosConfig = configs[0];
    const firstPosConfig = configs[1];

    expect(sixthPosConfig.partial).toBe(3);
    expect(firstPosConfig.partial).toBe(3);

    const relativeFirstPos = firstPosConfig.getSlidePosition(defaultPlayer);

    expect(sixthPosConfig.getSlidePosition(defaultPlayer)).toBeCloseTo(6.02, 2);
    expect(relativeFirstPos).toBeCloseTo(1.02, 2);

    // Check that open pos is slightly longer
    expect(relativeFirstPos).toBeLessThan(
      firstPosConfig.getOpenPosition(defaultPlayer, tromboneBbF),
    );
  });

  // note that was previously inaccessible
  it("B2 is accessible on a Bb/F trombone", () => {
    const note = Note.fromSciNotation("B2");

    const configs = tromboneBbF.getNoteConfigs(note, defaultPlayer);
    expect(configs).toHaveLength(1);
    const config = configs[0];
    expect(config.partial).toBe(3);
    expect(config.getSlidePosition(defaultPlayer)).toBeCloseTo(2.02, 2);
  });

  // note that is still inacessible
  it("C2 is still inacessible on a Bb/F trombone", () => {
    const note = Note.fromSciNotation("C2");

    const configs = tromboneBbF.getNoteConfigs(note, defaultPlayer);
    expect(configs).toHaveLength(0);
  });

  // Test lip bend
  const playerWithLipBend = new Player(20 as Hertz);
  // previously inaccessible note
  it("B2 is accesible on a Bb/F trombone with lip bend", () => {
    const note = Note.fromSciNotation("B1");

    const configs = tromboneBbF.getNoteConfigs(note, playerWithLipBend);
    expect(configs).toHaveLength(1);
    const config = configs[0];
    expect(config.partial).toBe(2);
    // Check that slide is maxed out
    expect(config.slideDistance).toBe(tromboneBbF.slideLength);
    expect(config.lipBendCents).toBeGreaterThan(0);
  });

  // Test that lip bend only applied when necessary
  it("C3 does not require lip bend on a Bb trombone", () => {
    const note = Note.fromSciNotation("C3");

    const configs = defaultTrombone.getNoteConfigs(note, playerWithLipBend);
    expect(configs).toHaveLength(1);
    const config = configs[0];
    expect(config.partial).toBe(3);
    expect(config.slideDistance).toBeLessThan(defaultTrombone.slideLength);
    expect(config.getSlidePosition(playerWithLipBend)).toBeCloseTo(6.02, 2);
    expect(config.lipBendCents).toBe(0);
  });

  // Test first pos distance
  const firstPosDistance = 0.001 as Meters;
  const playerWithFirstPosDistance = new Player(0 as Hertz, firstPosDistance);
  const tunedDefaultTrombone = Trombone.tuneFromTrombone(
    playerWithFirstPosDistance,
    defaultTrombone,
  );

  // Test basic note in first pos
  it("Bb2 is in first position on a Bb trombone with first pos distance", () => {
    const note = Note.fromSciNotation("Bb2");

    const configs = tunedDefaultTrombone.getNoteConfigs(
      note,
      playerWithFirstPosDistance,
    );

    expect(configs).toHaveLength(1);
    const config = configs[0];
    expect(config.slideDistance).toBeCloseTo(firstPosDistance, 10);
    expect(config.partial).toBe(2);
    expect(config.getSlidePosition(playerWithFirstPosDistance)).toBe(1);
  });

  // Test that non first pos notes maintain position
  it("C3 is still in 6th position on a Bb trombone with first pos distance", () => {
    const note = Note.fromSciNotation("C3");

    const configs = tunedDefaultTrombone.getNoteConfigs(
      note,
      playerWithFirstPosDistance,
    );

    expect(configs).toHaveLength(1);
    const config = configs[0];
    expect(config.partial).toBe(3);
    expect(config.getSlidePosition(playerWithFirstPosDistance)).toBeCloseTo(
      6.02,
      2,
    );
  });

  // Test that a previously accessible note could become inaccessible
  it("E2 can not be played on a default trombone with first pos distance", () => {
    const note = Note.fromSciNotation("E2");

    const configs = tunedDefaultTrombone.getNoteConfigs(
      note,
      playerWithFirstPosDistance,
    );

    expect(configs).toHaveLength(0);
  });
});
