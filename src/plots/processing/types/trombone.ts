import { Tuning } from "./tuning";
import type { Meters } from "./constants";

export class Trombone {
  public readonly tunings: Tuning[];
  public readonly slideLength: Meters;

  public constructor(tunings: Tuning[], slideLength: Meters) {
    this.tunings = tunings;
    this.slideLength = slideLength;
  }
}
