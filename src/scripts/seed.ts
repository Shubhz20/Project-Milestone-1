/**
 * Seed script — populates a local MongoDB with a demo user, a handful of
 * workout programs (one per category so the Factory gets a full workout),
 * associated goals, and a couple of workout sessions (one completed, one
 * active).
 *
 * Run with: `npm run seed`
 *
 * The script is idempotent on the demo user: it removes any existing records
 * owned by the seed user before re-inserting, so it can be run repeatedly
 * during development without drift. Other users' data is left untouched.
 */
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { Database } from "../config/db";
import { env } from "../config/env";
import { FitnessGoal } from "../models/FitnessGoal";
import { User } from "../models/User";
import { WorkoutProgram } from "../models/WorkoutProgram";
import { WorkoutSession } from "../models/WorkoutSession";
import { CalorieStrategyFactory } from "../services/calorie/CalorieFactory";

const DEMO_EMAIL = "demo@fitness.local";
const DEMO_PASSWORD = "Password123";

async function seed(): Promise<void> {
  const db = Database.getInstance();
  await db.connect();

  // Wipe anything owned by the demo user so repeat runs don't duplicate.
  const existing = await User.findOne({ email: DEMO_EMAIL });
  if (existing) {
    await Promise.all([
      WorkoutSession.deleteMany({ userId: existing._id }),
      FitnessGoal.deleteMany({ userId: existing._id }),
      WorkoutProgram.deleteMany({ userId: existing._id }),
    ]);
    await User.deleteOne({ _id: existing._id });
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const user = await User.create({
    name: "Demo Athlete",
    email: DEMO_EMAIL,
    password: passwordHash,
    weight: 72,
    height: 178,
  });

  const programsData = [
    {
      name: "Foundations of Strength",
      description: "Progressive compound-lift program.",
      category: "strength",
    },
    {
      name: "Zone 2 Cardio Base",
      description: "Aerobic base-building, 4 sessions per week.",
      category: "cardio",
    },
    {
      name: "Hatha Yoga Flow",
      description: "Mobility and recovery-focused yoga.",
      category: "yoga",
    },
    {
      name: "HIIT Conditioning",
      description: "Short, intense interval sessions for conditioning.",
      category: "hiit",
    },
  ];

  const programs = await WorkoutProgram.insertMany(
    programsData.map((p) => ({ ...p, userId: user._id }))
  );

  // One goal per program to exercise the cross-entity ownership check.
  await FitnessGoal.insertMany([
    {
      userId: user._id,
      programId: programs[0]!._id,
      title: "Bench press bodyweight for 5 reps",
      targetValue: 5,
      currentValue: 2,
      unit: "reps",
    },
    {
      userId: user._id,
      programId: programs[1]!._id,
      title: "Run a sub-25min 5k",
      targetValue: 25,
      currentValue: 27,
      unit: "minutes",
    },
    {
      userId: user._id,
      programId: programs[2]!._id,
      title: "Touch toes in a forward fold",
      targetValue: 1,
      currentValue: 1,
      unit: "milestone",
      isAchieved: true,
      achievedAt: new Date(),
    },
  ]);

  // One completed session from yesterday (for history) + one in-progress.
  const yesterdayStart = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const yesterdayEnd = new Date(yesterdayStart.getTime() + 45 * 60 * 1000);
  const strategy = CalorieStrategyFactory.for(programs[0]!.category);
  const kcal = strategy.estimate({ durationMinutes: 45, userWeightKg: user.weight });

  await WorkoutSession.create({
    userId: user._id,
    programId: programs[0]!._id,
    startTime: yesterdayStart,
    endTime: yesterdayEnd,
    durationMinutes: 45,
    caloriesBurned: kcal,
    notes: "Felt strong on squats; add 2.5kg next session.",
  });

  await WorkoutSession.create({
    userId: user._id,
    programId: programs[3]!._id,
    startTime: new Date(),
    notes: "Warm-up complete, starting intervals.",
  });

  // eslint-disable-next-line no-console
  console.log("[seed] done");
  // eslint-disable-next-line no-console
  console.log(`[seed] demo user: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  // eslint-disable-next-line no-console
  console.log(`[seed] connected to: ${env.MONGO_URI}`);

  await db.disconnect();
  await mongoose.connection.close();
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error("[seed] failed", err);
    process.exit(1);
  });
