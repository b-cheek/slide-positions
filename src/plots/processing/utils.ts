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
