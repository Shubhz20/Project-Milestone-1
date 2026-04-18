import { CalorieStrategy } from "./CalorieStrategy";
import {
  CardioStrategy,
  GeneralStrategy,
  HiitStrategy,
  StrengthStrategy,
  YogaStrategy,
} from "./strategies";

/**
 * Factory Pattern — CalorieStrategyFactory.
 *
 * Maps a program category to its concrete calorie strategy. Callers only
 * depend on the `CalorieStrategy` interface, so swapping in a new algorithm
 * is a registry change rather than a shotgun surgery across services.
 */
export class CalorieStrategyFactory {
  private static readonly registry: Record<string, CalorieStrategy> = {
    strength: new StrengthStrategy(),
    cardio: new CardioStrategy(),
    hiit: new HiitStrategy(),
    yoga: new YogaStrategy(),
    general: new GeneralStrategy(),
  };

  static for(category: string | undefined | null): CalorieStrategy {
    if (!category) return this.registry.general!;
    return this.registry[category.toLowerCase()] ?? this.registry.general!;
  }

  /** Exposed for tests and introspection. */
  static categories(): string[] {
    return Object.keys(this.registry);
  }
}
