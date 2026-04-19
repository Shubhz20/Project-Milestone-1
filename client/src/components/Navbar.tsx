import { useState, useRef, useEffect } from "react";
import { Bell, Search, User as UserIcon, CheckCircle2, Dumbbell, Target, Trophy } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

const MOCK_NOTIFICATIONS = [
  { id: "1", icon: Dumbbell, color: "text-primary", title: "Workout Started", desc: "Your latest session is now live.", time: "Just now", unread: true },
  { id: "2", icon: Target, color: "text-green-400", title: "Goal Progress", desc: "You are 80% towards your weight goal!", time: "2h ago", unread: true },
  { id: "3", icon: Trophy, color: "text-yellow-400", title: "Achievement Unlocked", desc: "You logged your first workout!", time: "Yesterday", unread: false },
];

export const Navbar = () => {
  const { user } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

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
        {/* Notifications */}
        <div className="relative" ref={ref}>
          <button
            onClick={() => setNotifOpen((prev) => !prev)}
            className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
          >
            <Bell className="w-5 h-5 text-white/70" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full text-[10px] font-bold text-bg-dark flex items-center justify-center shadow-lg shadow-primary/40 animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-3 w-80 z-50 rounded-2xl border border-white/10 bg-[rgba(10,10,20,0.95)] backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                <h4 className="font-bold text-sm">Notifications</h4>
                <button onClick={markAllRead} className="text-primary text-xs font-bold flex items-center gap-1 hover:underline">
                  <CheckCircle2 className="w-3 h-3" /> Mark all read
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`px-5 py-4 flex items-start gap-4 border-b border-white/5 hover:bg-white/5 transition-all cursor-pointer ${n.unread ? "bg-white/5" : ""}`}
                    onClick={() => setNotifications((prev) => prev.map((item) => item.id === n.id ? { ...item, unread: false } : item))}
                  >
                    <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                      <n.icon className={`w-4 h-4 ${n.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-sm truncate">{n.title}</p>
                        {n.unread && <span className="w-2 h-2 bg-primary rounded-full shrink-0" />}
                      </div>
                      <p className="text-xs text-white/50 mt-0.5 leading-relaxed">{n.desc}</p>
                      <p className="text-[10px] text-white/30 mt-1 font-bold uppercase tracking-wide">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-5 py-3 text-center">
                <button className="text-xs text-primary font-bold hover:underline">View all activity</button>
              </div>
            </div>
          )}
        </div>

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
