import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark">FT</span>
          <span className="brand-name">Fitness Tracker</span>
        </div>
        {user && (
          <nav className="app-nav">
            <NavLink to="/programs">Programs</NavLink>
            <NavLink to="/goals">Goals</NavLink>
            <NavLink to="/workouts">Workouts</NavLink>
          </nav>
        )}
        {user && (
          <div className="user-chip">
            <span>{user.name}</span>
            <button type="button" className="btn-ghost" onClick={handleLogout}>
              Sign out
            </button>
          </div>
        )}
      </header>
      <main className="app-main">
        <Outlet />
      </main>
      <footer className="app-footer">
        <small>Fitness Tracker · Professional Edition</small>
      </footer>
    </div>
  );
};
