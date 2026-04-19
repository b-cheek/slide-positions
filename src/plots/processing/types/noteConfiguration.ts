import { Hertz, Meters } from "./constants";
import { Tuning } from "./tuning";

export class NoteConfiguration {
  public readonly tuning: Tuning;
  public readonly slideDistance: Meters;
  public readonly partial: number;
  public readonly lip_bend_hz: Hertz; // Change to cents?

  public constructor(
    tuning: Tuning,
    slideDistance: Meters,
    partial: number,
    lip_bend_hz: Hertz,
  ) {
    this.tuning = tuning;
    this.slideDistance = slideDistance;
    this.partial = partial;
    this.lip_bend_hz = lip_bend_hz;
  }
}
