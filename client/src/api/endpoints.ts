import { request } from "./client";
import {
  Goal,
  LoginResponse,
  Program,
  User,
  WorkoutSession,
} from "./types";

/** Endpoint helpers grouped by resource. Controllers on the backend map 1:1. */

export const authApi = {
  register: (name: string, email: string, password: string) =>
    request<User>("/api/auth/register", {
      method: "POST",
      body: { name, email, password },
      auth: false,
    }),
  login: (email: string, password: string) =>
    request<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: { email, password },
      auth: false,
    }),
};

export const programsApi = {
  list: () => request<Program[]>("/api/programs"),
  create: (data: { name: string; description?: string; category?: string }) =>
    request<Program>("/api/programs", { method: "POST", body: data }),
  remove: (id: string) =>
    request<void>(`/api/programs/${id}`, { method: "DELETE" }),
};

export const goalsApi = {
  list: () => request<Goal[]>("/api/goals"),
  create: (data: {
    programId: string;
    title: string;
    targetValue: number;
    unit: string;
  }) => request<Goal>("/api/goals", { method: "POST", body: data }),
  markAchieved: (id: string) =>
    request<Goal>(`/api/goals/${id}/achieve`, { method: "PUT" }),
  remove: (id: string) =>
    request<void>(`/api/goals/${id}`, { method: "DELETE" }),
};

export const workoutsApi = {
  list: () => request<WorkoutSession[]>("/api/workouts"),
  start: (programId: string, notes?: string) =>
    request<WorkoutSession>("/api/workouts/start", {
      method: "POST",
      body: { programId, notes },
    }),
  end: (id: string) =>
    request<WorkoutSession>(`/api/workouts/${id}/end`, { method: "PATCH" }),
};
