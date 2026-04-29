import { Hertz, Meters } from "./constants";

export class Player {
  public readonly lipBendRange: Hertz;
  public readonly firstPosDistance: Meters;

  public constructor(
    lip_bend_range: Hertz = 0 as Hertz,
    first_pos_distance: Meters = 0 as Meters,
  ) {
    this.lipBendRange = lip_bend_range;
    this.firstPosDistance = first_pos_distance;
  }
}
