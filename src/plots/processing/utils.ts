import { SPEED_OF_SOUND } from "./types/constants";
import type { Hertz, Meters, RelativePosition } from "./types/constants";
import { NoteConfiguration } from "./types/noteConfiguration";
import { Player } from "./types/player";

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
