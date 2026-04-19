import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Dumbbell, 
  Target, 
  History, 
  User, 
  Utensils, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { cn } from "../api/utils";

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    { icon: Dumbbell, label: "Workouts", path: "/workouts" },
    { icon: Target, label: "Goals", path: "/goals" },
    { icon: History, label: "Programs", path: "/programs" },
    { icon: Utensils, label: "Diet Tracking", path: "/diet" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  if (!user) return null;

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-full glass-card rounded-none rounded-r-3xl transition-all duration-300 z-50 flex flex-col",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="p-6 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Dumbbell className="text-bg-dark w-6 h-6" />
            </div>
            <span className="font-extrabold text-xl tracking-tight">FITNESS<span className="text-primary">PRO</span></span>
          </div>
        )}
        {isCollapsed && (
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center mx-auto">
            <Dumbbell className="text-bg-dark w-6 h-6" />
          </div>
        )}
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group text-white/70 hover:text-white hover:bg-white/10",
              isActive && "bg-primary/20 text-primary hover:bg-primary/30",
              isCollapsed && "justify-center"
            )}
            title={isCollapsed ? item.label : ""}
          >
            <item.icon className={cn("w-6 h-6", isCollapsed ? "m-0" : "")} />
            {!isCollapsed && <span className="font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={logout}
          className={cn(
            "w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-all",
            isCollapsed && "justify-center"
          )}
        >
          <LogOut className="w-6 h-6" />
          {!isCollapsed && <span className="font-medium text-sm">Logout</span>}
        </button>
        
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center transition-all group"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-white" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-white" />
          )}
        </button>
      </div>
    </aside>
  );
};
