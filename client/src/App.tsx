import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ProgramsPage } from "./pages/ProgramsPage";
import { GoalsPage } from "./pages/GoalsPage";
import { WorkoutsPage } from "./pages/WorkoutsPage";

/**
 * Route table for the Fitness Tracker SPA.
 *
 * - `/login`, `/register` are public.
 * - Everything under Layout is gated by `<ProtectedRoute>` so unauthenticated
 *   access redirects to the login screen.
 */
export const App = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />

    <Route
      element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }
    >
      <Route path="/programs" element={<ProgramsPage />} />
      <Route path="/goals" element={<GoalsPage />} />
      <Route path="/workouts" element={<WorkoutsPage />} />
      <Route path="/" element={<Navigate to="/programs" replace />} />
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);
