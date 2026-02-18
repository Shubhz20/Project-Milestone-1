import express from "express";

import authRoutes from "./routes/auth.routes";
import programRoutes from "./routes/program.routes";
import goalRoutes from "./routes/goal.routes";
import workoutRoutes from "./routes/workout.routes";

const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/programs", programRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/workouts", workoutRoutes);

export default app;
