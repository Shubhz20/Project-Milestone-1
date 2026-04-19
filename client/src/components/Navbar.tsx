import { Bell, Search, User as UserIcon } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

export const Navbar = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <nav className="h-20 flex items-center justify-between px-8 bg-transparent">
      <div className="relative group max-w-md w-full">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-white/40 group-focus-within:text-primary transition-colors" />
        </div>
        <input
          type="text"
          className="glass-input pl-10 w-full"
          placeholder="Search workouts or tips..."
        />
      </div>

      <div className="flex items-center gap-6">
        <button className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all">
          <Bell className="w-5 h-5 text-white/70" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-pulse shadow-sm shadow-primary/50" />
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-white/10">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-white">{user.name}</p>
            <p className="text-xs text-white/50">{user.email}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg shadow-primary/20">
            <UserIcon className="w-6 h-6 text-bg-dark" />
          </div>
        </div>
      </div>
    </nav>
  );
};
