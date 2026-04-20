import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { ProgramsPage } from "./pages/ProgramsPage";
import { GoalsPage } from "./pages/GoalsPage";
import { WorkoutsPage } from "./pages/WorkoutsPage";
import { Dashboard } from "./pages/Dashboard";
import { ProfilePage } from "./pages/ProfilePage";
import { DietPage } from "./pages/DietPage";

/**
 * Route table for the Fitness Tracker SPA.
 */
export const App = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />

    <Route
      element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }
    >
      <Route path="/" element={<Dashboard />} />
      <Route path="/programs" element={<ProgramsPage />} />
      <Route path="/goals" element={<GoalsPage />} />
      <Route path="/workouts" element={<WorkoutsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/diet" element={<DietPage />} />
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);
