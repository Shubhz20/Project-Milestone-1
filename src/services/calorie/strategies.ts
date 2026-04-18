import { CalorieContext, CalorieStrategy } from "./CalorieStrategy";

/**
 * Calorie estimates use the standard MET (Metabolic Equivalent of Task)
 * formula:  kcal = MET × weightKg × hours
 *
 * When no weight is recorded for the user we fall back to an average adult
 * weight (70 kg) so the UI still has a sensible number.
 */
const DEFAULT_WEIGHT_KG = 70;

abstract class MetBasedStrategy implements CalorieStrategy {
  abstract readonly name: string;
  protected abstract readonly met: number;

  estimate({ durationMinutes, userWeightKg }: CalorieContext): number {
    if (durationMinutes <= 0) return 0;
    const weight = userWeightKg && userWeightKg > 0 ? userWeightKg : DEFAULT_WEIGHT_KG;
    const hours = durationMinutes / 60;
    return Math.round(this.met * weight * hours);
  }
}

export class StrengthStrategy extends MetBasedStrategy {
  readonly name = "strength";
  protected readonly met = 6.0; // general weight lifting
}

export class CardioStrategy extends MetBasedStrategy {
  readonly name = "cardio";
  protected readonly met = 8.0; // running, moderate pace
}

export class HiitStrategy extends MetBasedStrategy {
  readonly name = "hiit";
  protected readonly met = 10.0; // high-intensity intervals
}

export class YogaStrategy extends MetBasedStrategy {
  readonly name = "yoga";
  protected readonly met = 3.0;
}

export class GeneralStrategy extends MetBasedStrategy {
  readonly name = "general";
  protected readonly met = 4.5;
}
