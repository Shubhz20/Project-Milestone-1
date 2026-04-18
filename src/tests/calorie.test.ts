import { test } from "node:test";
import assert from "node:assert/strict";
import { CalorieStrategyFactory } from "../services/calorie/CalorieFactory";
import { CardioStrategy, StrengthStrategy, HiitStrategy, YogaStrategy, GeneralStrategy } from "../services/calorie/strategies";

test("factory: returns the right strategy per category", () => {
  assert.ok(CalorieStrategyFactory.for("cardio") instanceof CardioStrategy);
  assert.ok(CalorieStrategyFactory.for("strength") instanceof StrengthStrategy);
  assert.ok(CalorieStrategyFactory.for("hiit") instanceof HiitStrategy);
  assert.ok(CalorieStrategyFactory.for("yoga") instanceof YogaStrategy);
  assert.ok(CalorieStrategyFactory.for("general") instanceof GeneralStrategy);
});

test("factory: falls back to general for unknown/empty categories", () => {
  assert.ok(CalorieStrategyFactory.for(undefined) instanceof GeneralStrategy);
  assert.ok(CalorieStrategyFactory.for(null) instanceof GeneralStrategy);
  assert.ok(CalorieStrategyFactory.for("underwater-basket-weaving") instanceof GeneralStrategy);
});

test("factory: category lookup is case-insensitive", () => {
  assert.ok(CalorieStrategyFactory.for("CARDIO") instanceof CardioStrategy);
  assert.ok(CalorieStrategyFactory.for("Strength") instanceof StrengthStrategy);
});

test("strategy: cardio produces higher estimate than yoga for identical inputs", () => {
  const ctx = { durationMinutes: 60, userWeightKg: 70 };
  const cardio = CalorieStrategyFactory.for("cardio").estimate(ctx);
  const yoga = CalorieStrategyFactory.for("yoga").estimate(ctx);
  assert.ok(cardio > yoga, `expected cardio (${cardio}) > yoga (${yoga})`);
});

test("strategy: HIIT uses default weight when user weight missing", () => {
  const kcal = CalorieStrategyFactory.for("hiit").estimate({ durationMinutes: 30 });
  // 10 MET × 70 kg × 0.5 h = 350 kcal
  assert.equal(kcal, 350);
});

test("strategy: zero duration produces zero calories", () => {
  for (const cat of CalorieStrategyFactory.categories()) {
    const kcal = CalorieStrategyFactory.for(cat).estimate({ durationMinutes: 0, userWeightKg: 80 });
    assert.equal(kcal, 0, `${cat} should return 0 for zero-minute workout`);
  }
});

test("strategy: estimate scales linearly with duration", () => {
  const strat = CalorieStrategyFactory.for("strength");
  const half = strat.estimate({ durationMinutes: 30, userWeightKg: 80 });
  const full = strat.estimate({ durationMinutes: 60, userWeightKg: 80 });
  // Allow ±1 for rounding
  assert.ok(Math.abs(full - 2 * half) <= 1);
});
