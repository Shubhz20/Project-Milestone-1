import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authApi } from "../api/endpoints";
import { tokenStore } from "../api/client";
import { User } from "../api/types";

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthCtx = createContext<AuthState | null>(null);

/**
 * AuthProvider — single source of truth for the currently signed-in user.
 *
 * We intentionally keep this minimal (no third-party state library). The
 * backend's JWT payload is our source of truth; we persist the token in
 * localStorage and decode nothing ourselves — the server validates on
 * every request.
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore a persisted user on initial render so a page refresh doesn't
    // kick the user back to the login screen.
    const raw = localStorage.getItem("fitness-tracker.user");
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        /* corrupt — fall through to unauthenticated */
      }
    }
    setLoading(false);
  }, []);

  const persist = (u: User | null) => {
    if (u) localStorage.setItem("fitness-tracker.user", JSON.stringify(u));
    else localStorage.removeItem("fitness-tracker.user");
    setUser(u);
  };

  const login = useCallback(async (email: string, password: string) => {
    const { token, user: u } = await authApi.login(email, password);
    tokenStore.set(token);
    persist(u);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    await authApi.register(name, email, password);
    // Auto-login after a successful registration so the user lands straight
    // in the app instead of bouncing to /login.
    await login(email, password);
  }, [login]);

  const logout = useCallback(() => {
    tokenStore.clear();
    persist(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
};

export const useAuth = (): AuthState => {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
