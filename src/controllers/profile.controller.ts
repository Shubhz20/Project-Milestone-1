import { Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { AuthRequest } from "../middlewares/auth.middleware";
import { ProfileService } from "../services/profile.service";
import { RecommendationService } from "../services/recommendation.service";
import { UnauthorizedError } from "../errors/AppError";

/**
 * ProfileController — thin controller that exposes the profile, dashboard,
 * recommendations, and weight-logging endpoints. All business logic lives in
 * ProfileService and RecommendationService.
 */
export class ProfileController {
  constructor(
    private readonly profiles: ProfileService = new ProfileService(),
    private readonly recommender: RecommendationService = new RecommendationService()
  ) {}

  private requireUserId(req: AuthRequest): string {
    if (!req.userId) throw new UnauthorizedError("Not authenticated");
    return req.userId;
  }

  /** GET /api/profile → full dashboard payload (profile + stats). */
  getDashboard = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = this.requireUserId(req);
    const dashboard = await this.profiles.getDashboard(userId);
    res.json(dashboard);
  });

  /** PUT /api/profile → update profile fields (any subset). */
  updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = this.requireUserId(req);
    const updated = await this.profiles.updateProfile(userId, req.body);
    res.json({
      id: updated._id,
      name: updated.name,
      email: updated.email,
      age: updated.age,
      height: updated.height,
      weight: updated.weight,
      gender: updated.gender,
      fitnessLevel: updated.fitnessLevel,
      bio: updated.bio,
    });
  });

  /** POST /api/profile/weight → log a new weight entry. */
  logWeight = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = this.requireUserId(req);
    const updated = await this.profiles.logWeight(userId, req.body.weightKg);
    res.status(201).json({
      weight: updated.weight,
      weightHistory: updated.weightHistory,
    });
  });

  /** GET /api/profile/recommendations → ranked program templates for the user. */
  recommendations = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = this.requireUserId(req);
    const dashboard = await this.profiles.getDashboard(userId);
    // We only need the IUser to score, so pick a minimal shape that matches.
    const user = {
      height: dashboard.user.height,
      weight: dashboard.user.weight,
      age: dashboard.user.age,
      fitnessLevel: dashboard.user.fitnessLevel as any,
      gender: dashboard.user.gender as any,
    } as any;
    const recommendations = this.recommender.recommendFor(user, 6);
    res.json({
      recommendations,
      catalog: this.recommender.catalog(),
      meta: {
        bmi: dashboard.body.bmi,
        bmiCategory: dashboard.body.bmiCategory,
        fitnessLevel: dashboard.user.fitnessLevel ?? null,
      },
    });
  });
}
