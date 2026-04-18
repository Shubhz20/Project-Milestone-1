/**
 * Strategy Pattern — CalorieStrategy.
 *
 * Estimating calories burned varies considerably by workout style. Rather
 * than cramming `if (program.category === "strength") ... else if ...` into
 * WorkoutService, each algorithm lives in its own class implementing this
 * interface. New program types can be added by writing a new strategy and
 * registering it with the factory, without touching the service.
 */
export interface CalorieContext {
  durationMinutes: number;
  userWeightKg?: number;
}

export interface CalorieStrategy {
  readonly name: string;
  estimate(ctx: CalorieContext): number;
}
