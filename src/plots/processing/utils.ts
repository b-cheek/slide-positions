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
