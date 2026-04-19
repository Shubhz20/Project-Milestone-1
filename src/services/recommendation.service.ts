import { IUser } from "../models/User";
import { CalorieStrategyFactory } from "./calorie/CalorieFactory";
import { PROGRAM_CATEGORIES, ProgramCategory } from "../validators/program.validator";

export interface ProgramTemplate {
  key: string;
  name: string;
  description: string;
  category: ProgramCategory;
  intensity: "low" | "moderate" | "high";
  /** Recommended session duration in minutes — used to preview calorie burn. */
  suggestedMinutes: number;
  /** Fitness-level floor: users below this level shouldn't start here cold. */
  minLevel: "beginner" | "intermediate" | "advanced";
  /** High-level goal this template serves. */
  primaryGoal:
    | "weight_loss"
    | "muscle_gain"
    | "endurance"
    | "flexibility"
    | "general_health";
  /** Ideal BMI range; `null` on either side = unbounded. */
  idealBmiRange?: [number | null, number | null];
}

/**
 * Curated template library — the "catalog" from which we recommend. These are
 * intentionally static so the app always has content even for a brand-new
 * user with an empty database.
 */
export const PROGRAM_TEMPLATES: ProgramTemplate[] = [
  {
    key: "couch-to-5k",
    name: "Couch-to-5k",
    description:
      "A 9-week cardio progression from walking intervals to a continuous 5k run. Ideal if you're restarting activity after a long break.",
    category: "cardio",
    intensity: "moderate",
    suggestedMinutes: 30,
    minLevel: "beginner",
    primaryGoal: "weight_loss",
    idealBmiRange: [25, null],
  },
  {
    key: "full-body-strength-foundations",
    name: "Full-Body Strength Foundations",
    description:
      "Compound lifts (squat, press, row) three times a week with linear progression. Builds the base for any strength goal.",
    category: "strength",
    intensity: "moderate",
    suggestedMinutes: 45,
    minLevel: "beginner",
    primaryGoal: "muscle_gain",
    idealBmiRange: [18.5, 30],
  },
  {
    key: "hiit-fat-burner",
    name: "HIIT Fat Burner",
    description:
      "Short, intense circuits (20-min Tabata-style blocks) that maximise calorie burn per minute — best paired with a strength day.",
    category: "hiit",
    intensity: "high",
    suggestedMinutes: 25,
    minLevel: "intermediate",
    primaryGoal: "weight_loss",
    idealBmiRange: [22, 35],
  },
  {
    key: "yoga-mobility-flow",
    name: "Yoga & Mobility Flow",
    description:
      "Vinyasa-based flows focused on joint mobility, breath, and active recovery. Pairs well with any strength or cardio block.",
    category: "yoga",
    intensity: "low",
    suggestedMinutes: 40,
    minLevel: "beginner",
    primaryGoal: "flexibility",
  },
  {
    key: "endurance-base-builder",
    name: "Endurance Base Builder",
    description:
      "Zone-2 cardio 4 days a week to grow aerobic capacity. Ideal if you're training for a distance event or general stamina.",
    category: "cardio",
    intensity: "moderate",
    suggestedMinutes: 50,
    minLevel: "intermediate",
    primaryGoal: "endurance",
  },
  {
    key: "hypertrophy-upper-lower",
    name: "Hypertrophy Upper/Lower",
    description:
      "Four-day upper/lower split with volume periodisation. Made for users who've mastered compound lifts and want visible muscle growth.",
    category: "strength",
    intensity: "high",
    suggestedMinutes: 60,
    minLevel: "advanced",
    primaryGoal: "muscle_gain",
    idealBmiRange: [18.5, 28],
  },
  {
    key: "active-wellness",
    name: "Active Wellness",
    description:
      "Low-impact mix of walking, mobility, and bodyweight circuits. Perfect as a daily-activity floor or for returning from injury.",
    category: "general",
    intensity: "low",
    suggestedMinutes: 30,
    minLevel: "beginner",
    primaryGoal: "general_health",
  },
];

export interface ProgramRecommendation {
  template: ProgramTemplate;
  /** Score 0–100 — higher = better fit for the user right now. */
  score: number;
  /** Human-readable sentences explaining *why* this template scored. */
  rationale: string[];
  /** Calorie burn preview personalised to the user's current weight. */
  estimatedCaloriesPerSession: number;
}

const LEVEL_RANK: Record<NonNullable<IUser["fitnessLevel"]>, number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
};

const bmiOf = (user: IUser): number | null => {
  if (!user.height || !user.weight) return null;
  const m = user.height / 100;
  return +(user.weight / (m * m)).toFixed(1);
};

/**
 * RecommendationService — turns raw user profile into a ranked list of
 * program templates with a rationale and personalised calorie preview.
 *
 * The algorithm uses a transparent, weighted-sum scoring model so the
 * rationale is human-readable (no black box). Each heuristic contributes a
 * capped number of points plus a reasoning sentence.
 */
export class RecommendationService {
  /** Produce a ranked list of recommended templates for this user. */
  recommendFor(user: IUser, limit = 5): ProgramRecommendation[] {
    const bmi = bmiOf(user);
    const userLevel = user.fitnessLevel ?? "beginner";
    const userLevelRank = LEVEL_RANK[userLevel];

    const scored: ProgramRecommendation[] = PROGRAM_TEMPLATES.map((tpl) => {
      const rationale: string[] = [];
      let score = 50; // neutral baseline

      // Fitness-level match. We *allow* recommending one level above to
      // encourage stretch, but penalise two levels above.
      const minRank = LEVEL_RANK[tpl.minLevel];
      const diff = userLevelRank - minRank;
      if (diff >= 0) {
        score += 20;
        rationale.push(
          `Matches your ${userLevel} level (minimum: ${tpl.minLevel}).`
        );
      } else if (diff === -1) {
        score += 5;
        rationale.push(
          `A slight stretch: this program targets ${tpl.minLevel}s, but completing it could level you up from ${userLevel}.`
        );
      } else {
        score -= 25;
        rationale.push(
          `Likely too advanced — requires ${tpl.minLevel} experience, and you're currently ${userLevel}.`
        );
      }

      // BMI fit.
      if (bmi !== null && tpl.idealBmiRange) {
        const [lo, hi] = tpl.idealBmiRange;
        const insideLow = lo === null || bmi >= lo;
        const insideHigh = hi === null || bmi <= hi;
        if (insideLow && insideHigh) {
          score += 15;
          rationale.push(
            `Your BMI (${bmi}) lands in this program's ideal range${
              lo !== null || hi !== null
                ? ` (${lo ?? "≤"}${hi ? `–${hi}` : "+"})`
                : ""
            }.`
          );
        } else {
          score -= 10;
          rationale.push(
            `Your BMI (${bmi}) is outside the ideal range for this program — it may still help but isn't the best first pick.`
          );
        }
      }

      // Goal-specific bonuses based on profile cues.
      if (bmi !== null && bmi >= 25 && tpl.primaryGoal === "weight_loss") {
        score += 10;
        rationale.push(
          "Weight-loss focus aligns with your current BMI classification."
        );
      }
      if (bmi !== null && bmi < 18.5 && tpl.primaryGoal === "muscle_gain") {
        score += 10;
        rationale.push(
          "Muscle-gain focus suits a lower current BMI — pairs with a surplus diet."
        );
      }
      if (
        user.age !== undefined &&
        user.age >= 50 &&
        (tpl.primaryGoal === "flexibility" ||
          tpl.primaryGoal === "general_health")
      ) {
        score += 10;
        rationale.push(
          "Joint-friendly focus is appropriate for your age bracket."
        );
      }
      if (
        user.age !== undefined &&
        user.age < 30 &&
        tpl.intensity === "high"
      ) {
        score += 5;
        rationale.push(
          "High-intensity work is well-tolerated in your age bracket."
        );
      }

      // Normalise.
      score = Math.max(0, Math.min(100, Math.round(score)));

      // Calorie preview using the same engine the backend uses for live
      // sessions — keeps the number trustworthy and consistent.
      const strategy = CalorieStrategyFactory.for(tpl.category);
      const estimated = strategy.estimate({
        durationMinutes: tpl.suggestedMinutes,
        userWeightKg: user.weight,
      });

      return {
        template: tpl,
        score,
        rationale,
        estimatedCaloriesPerSession: estimated,
      };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit);
  }

  /** All templates surfaced as a simple catalog (unranked). */
  catalog(): ProgramTemplate[] {
    return PROGRAM_TEMPLATES;
  }

  /** Allowed primary-goal values, for validators / frontend dropdowns. */
  goals(): string[] {
    return [
      "weight_loss",
      "muscle_gain",
      "endurance",
      "flexibility",
      "general_health",
    ];
  }

  /** Known categories. */
  categories(): readonly string[] {
    return PROGRAM_CATEGORIES;
  }
}
