import { Schema } from "./schema";

export const registerSchema: Schema = {
  name: { type: "string", required: true, min: 2, max: 80 },
  email: { type: "string", required: true, min: 5, max: 120 },
  password: { type: "string", required: true, min: 6, max: 128 },
};

export const loginSchema: Schema = {
  email: { type: "string", required: true, min: 5, max: 120 },
  password: { type: "string", required: true, min: 1, max: 128 },
};

export const forgotPasswordSchema: Schema = {
  email: { type: "string", required: true, min: 5, max: 120 },
};

export const resetPasswordSchema: Schema = {
  resetToken: { type: "string", required: true, min: 16, max: 256 },
  newPassword: { type: "string", required: true, min: 6, max: 128 },
};
