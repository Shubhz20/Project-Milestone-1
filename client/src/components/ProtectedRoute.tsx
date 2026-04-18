import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

/**
 * Route guard — renders its children only for authenticated users.
 * Delegates to react-router's Navigate for redirects so back/forward buttons
 * continue to behave naturally.
 */
export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <p className="text-muted">Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};
