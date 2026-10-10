export interface Weights {
  lipBendCentsCost: number;
  slideDistanceCost: number;
  slideProportionCost: number;
  tuningCost: number;
  partialChangeCost: number;
  slideDistanceChangeCost: number;
  slideProportionChangeCost: number;
  directionChangeCost: number;
  velocityChangeCost: number;
  // Farther out slide is more acceptable in lower ranges
  slideDistanceRangeRelativeCost: number;
  slideProportionRangeRelativeCost: number;
  tuningRangeRelativeCost: number;
}

import optimizedWeights from "../utils/optimizedWeights.json";

// emission cost weights
// TODO: should lip bend cents matter? lip bend only available when no other option
export const LIP_BEND_CENTS_COST = 0.1;
export const SLIDE_DISTANCE_COST = 0; // multiplied by slide distance in meters (0-0.7m for standard tenor trombone)
export const SLIDE_PROPORTION_COST = 1; // multiplied by slide proportion (slide distance / max slide length)
export const TUNING_COST = 0.5; // multiplied by tuning index in user-defined order (0-1 for standard tenor trombone)
// range relative factors (farther out slide is more acceptable in lower ranges)
export const SLIDE_DISTANCE_RANGE_RELATIVE_COST = 0.01; // multiplied by slide distance range relative factor
export const SLIDE_PROPORTION_RANGE_RELATIVE_COST = 0.01; // multiplied by slide proportion range relative factor
export const TUNING_RANGE_RELATIVE_COST = 0.01; // multiplied by tuning range relative factor

// transition cost weights
export const PARTIAL_CHANGE_COST = 0.25; // * partial delta
export const SLIDE_DISTANCE_CHANGE_COST = 0; // * abs slide distance delta
export const SLIDE_PROPORTION_CHANGE_COST = 2; // * abs(slide proportion delta)
export const DIRECTION_CHANGE_COST = 0; // added if direction changes
export const VELOCITY_CHANGE_COST = 1; // * abs(velocity delta)

// TODO:
// Make user configurable
// speed dependent?
// tuning delta, but depends on configuration
// and probably much more. AI model?

// Reference values for the current path-selection behavior.
export const REFERENCE_WEIGHTS: Weights = {
  lipBendCentsCost: LIP_BEND_CENTS_COST,
  slideDistanceCost: SLIDE_DISTANCE_COST,
  slideProportionCost: SLIDE_PROPORTION_COST,
  tuningCost: TUNING_COST,
  partialChangeCost: PARTIAL_CHANGE_COST,
  slideDistanceChangeCost: SLIDE_DISTANCE_CHANGE_COST,
  slideProportionChangeCost: SLIDE_PROPORTION_CHANGE_COST,
  directionChangeCost: DIRECTION_CHANGE_COST,
  velocityChangeCost: VELOCITY_CHANGE_COST,
  slideDistanceRangeRelativeCost: SLIDE_DISTANCE_RANGE_RELATIVE_COST,
  slideProportionRangeRelativeCost: SLIDE_PROPORTION_RANGE_RELATIVE_COST,
  tuningRangeRelativeCost: TUNING_RANGE_RELATIVE_COST,
};

export const OPTIMIZED_WEIGHTS: Weights = optimizedWeights;

// Change this one variable to switch the weights used by the application.
export const ACTIVE_WEIGHTS = OPTIMIZED_WEIGHTS;
