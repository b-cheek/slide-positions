import { SPEED_OF_SOUND } from "./types/constants";
import type {
  AbsolutePosition,
  Hertz,
  Meters,
  RelativePosition,
} from "./types/constants";
import { NoteConfiguration } from "./types/noteConfiguration";
import { Player } from "./types/player";
import { Trombone } from "./types/trombone";

export function freqToLength(freq: Hertz): Meters {
  // in a tube open at both ends (trombone)
  return (SPEED_OF_SOUND / (2 * freq)) as Meters;
}

export function lengthToFreq(length: Meters): Hertz {
  // in a tube open at both ends (trombone)
  return (SPEED_OF_SOUND / (2 * length)) as Hertz;
}

export function getSlidePosition(
  player: Player,
  noteConfig: NoteConfiguration,
): RelativePosition {
  // Not simplifying for readability
  return (Math.log2(
    (noteConfig.tuning.length + noteConfig.slideDistance) /
      (noteConfig.tuning.length + player.first_pos_distance),
  ) *
    12 +
    1) as RelativePosition;
}

export function getOpenPosition(
  player: Player,
  trombone: Trombone,
  noteConfig: NoteConfiguration,
): AbsolutePosition {
  const openLen = trombone.tunings[0].length;
  return (Math.log2(
    (openLen + noteConfig.slideDistance) /
      (openLen + player.first_pos_distance),
  ) *
    12 +
    1) as AbsolutePosition;
}
