import { SPEED_OF_SOUND } from "./types/constants";

export function freqToLength(freq: number): number {
  // in a tube open at both ends (trombone)
  return SPEED_OF_SOUND / (2 * freq);
}

export function lengthToFreq(length: number): number {
  // in a tube open at both ends (trombone)
  return SPEED_OF_SOUND / (2 * length);
}
