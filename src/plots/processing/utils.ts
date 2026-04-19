import { SPEED_OF_SOUND } from "./types/constants";
import type { Hertz, Meters } from "./types/constants";

export function freqToLength(freq: Hertz): Meters {
  // in a tube open at both ends (trombone)
  return (SPEED_OF_SOUND / (2 * freq)) as Meters;
}

export function lengthToFreq(length: Meters): Hertz {
  // in a tube open at both ends (trombone)
  return (SPEED_OF_SOUND / (2 * length)) as Hertz;
}

// TODO: complete evaluation of how many times computed parts of
// noteconfig, note, trombone etc are accessed
// to determine if public readonly vs getter more appropriate
