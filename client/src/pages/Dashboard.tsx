import { useEffect, useState } from "react";
import { profileApi, workoutsApi } from "../api/endpoints";
import { ProfileDashboard, WorkoutSession } from "../api/types";
import { dataCache } from "../api/cache";
import { useAuth } from "../auth/AuthContext";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Dumbbell, 
  Target, 
  Flame, 
  Calendar,
  Activity,
  ArrowUpRight
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";

const data = [
  { day: "Mon", calories: 2100, workouts: 1 },
  { day: "Tue", calories: 1800, workouts: 0 },
  { day: "Wed", calories: 2400, workouts: 2 },
  { day: "Thu", calories: 2200, workouts: 1 },
  { day: "Fri", calories: 2800, workouts: 1 },
  { day: "Sat", calories: 1500, workouts: 0 },
  { day: "Sun", calories: 2300, workouts: 1 },
];

const COLORS = ["#00d2ff", "#3a7bd5", "#00d2ff", "#3a7bd5", "#00d2ff", "#3a7bd5", "#00d2ff"];

const DASH_CACHE_KEY = "dashboard";
const SESSIONS_CACHE_KEY = "recentSessions";

export const Dashboard = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<ProfileDashboard | null>(() => {
    if (user) return dataCache.get<ProfileDashboard>(user.id, DASH_CACHE_KEY);
    return null;
  });
  const [recentSessions, setRecentSessions] = useState<WorkoutSession[]>(() => {
    if (user) return dataCache.get<WorkoutSession[]>(user.id, SESSIONS_CACHE_KEY) ?? [];
    return [];
  });

  useEffect(() => {
    profileApi.get().then((d) => {
      setDashboard(d);
      if (user) dataCache.set(user.id, DASH_CACHE_KEY, d);
    }).catch(() => {});

    workoutsApi.list().then((s) => {
      const recent = s.slice(0, 4);
      setRecentSessions(recent);
      if (user) dataCache.set(user.id, SESSIONS_CACHE_KEY, recent);
    }).catch(() => {});
  }, []);

  const relativeTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.round(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.round(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.round(hrs / 24)}d ago`;
  };

  const stats = [
    { label: "Active Workouts", value: dashboard?.stats.activeWorkouts ?? 0, icon: Dumbbell, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Calories Burned", value: dashboard?.stats.totalCaloriesBurned ?? 0, icon: Flame, color: "text-orange-400", bg: "bg-orange-400/10" },
    { label: "Goals Met", value: `${dashboard?.goals.achieved ?? 0}/${dashboard?.goals.total ?? 0}`, icon: Target, color: "text-green-400", bg: "bg-green-400/10" },
    { label: "Current Streak", value: `${dashboard?.stats.currentStreakDays ?? 0} days`, icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-400/10" },
  ];

  return (
    <div className="space-y-8">
      <header>
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-extrabold"
        >
          Activity <span className="text-primary">Overview</span>
        </motion.h1>
        <p className="text-white/50 mt-1">Track your progress and stay consistent.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 flex items-center gap-4 hover:scale-[1.02] transition-transform cursor-pointer"
          >
            <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-white/40 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Charts Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Activity className="text-primary w-6 h-6" />
              <h3 className="text-xl font-bold">Calories Burned Trends</h3>
            </div>
            <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm outline-none">
              <option>Last 7 Days</option>
              <option>Last Month</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d2ff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00d2ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#666", fontSize: 12 }}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "rgba(10, 10, 10, 0.9)", 
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    backdropFilter: "blur(10px)"
                  }}
                  itemStyle={{ color: "#00d2ff" }}
                />
                <Area 
                  type="monotone" 
                  dataKey="calories" 
                  stroke="#00d2ff" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorCal)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Calendar className="text-primary w-6 h-6" />
              <h3 className="text-xl font-bold">Workout Frequency</h3>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#666", fontSize: 12 }}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ 
                    backgroundColor: "rgba(10, 10, 10, 0.9)", 
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    backdropFilter: "blur(10px)"
                  }}
                />
                <Bar dataKey="workouts" radius={[10, 10, 0, 0]}>
                  {data.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Recent Activity</h3>
          <button className="text-primary flex items-center gap-2 hover:underline transition-all">
            View All <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-4">
          {recentSessions.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center space-y-2">
              <Dumbbell className="w-8 h-8 text-white/10" />
              <p className="text-white/30 text-sm">No sessions logged yet.<br />Head to Workouts to start tracking.</p>
            </div>
          ) : (
            recentSessions.map((session) => (
              <div key={session._id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-transparent hover:border-white/10 hover:bg-white/10 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${!session.endTime ? "bg-primary/20 animate-pulse" : "bg-white/5"}`}>
                    <Dumbbell className={`w-5 h-5 ${!session.endTime ? "text-primary" : "text-white/30"}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold">Training Session</p>
                      {!session.endTime && <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">LIVE</span>}
                    </div>
                    <p className="text-xs text-white/40">{relativeTime(session.startTime)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">
                    {session.caloriesBurned ? `${session.caloriesBurned} kcal` : session.endTime ? "—" : "In progress"}
                  </p>
                  <p className="text-xs text-white/40 uppercase font-bold tracking-tighter">
                    {session.durationMinutes ? `${session.durationMinutes} min` : "—"}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};
