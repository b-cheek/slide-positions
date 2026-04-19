import { Hertz, Meters } from "./constants";

export class Player {
  public readonly lipBendRange: Hertz;
  public readonly firstPosDistance: Meters;

  public constructor(lip_bend_range: Hertz, first_pos_distance: Meters) {
    this.lipBendRange = lip_bend_range;
    this.firstPosDistance = first_pos_distance;
  }
}
