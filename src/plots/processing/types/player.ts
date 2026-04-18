import { Hertz, Meters } from "./constants";

export class Player {
  public readonly lip_bend_range: Hertz;
  public readonly first_pos_distance: Meters;

  public constructor(lip_bend_range: Hertz, first_pos_distance: Meters) {
    this.lip_bend_range = lip_bend_range;
    this.first_pos_distance = first_pos_distance;
  }
}
