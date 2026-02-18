import { WorkoutRepository } from "../repositories/workout.repository";
import { WorkoutSession } from "../models/WorkoutSession";

export class WorkoutService {
  private workoutRepo: WorkoutRepository;

  constructor() {
    this.workoutRepo = new WorkoutRepository();
  }

  async startWorkout(data: any) {
    return this.workoutRepo.create(data);
  }

  async endWorkout(id: string) {
    const session = await this.workoutRepo.findById(id);
    if (!session) throw new Error("Session not found");

    const endTime = new Date();
    const durationMinutes = Math.round(
      (endTime.getTime() - session.startTime.getTime()) / 60000
    );

    return this.workoutRepo.update(id, { endTime, durationMinutes });
  }

  async getWorkouts(userId: string) {
    return this.workoutRepo.findByUser(userId);
  }
}
