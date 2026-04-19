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

export const Dashboard = () => {
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
        {[
          { label: "Active Workouts", value: "12", icon: Dumbbell, color: "text-blue-400", bg: "bg-blue-400/10" },
          { label: "Calories Burned", value: "4,250", icon: Flame, color: "text-orange-400", bg: "bg-orange-400/10" },
          { label: "Goals Met", value: "8/12", icon: Target, color: "text-green-400", bg: "bg-green-400/10" },
          { label: "Weekly Progress", value: "+15%", icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-400/10" },
        ].map((stat, i) => (
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
          {[
            { title: "Push Workout", time: "2 hours ago", energy: "450 kcal", category: "Strength" },
            { title: "Morning Run", time: "5 hours ago", energy: "620 kcal", category: "Cardio" },
            { title: "Squat Session", time: "Yesterday", energy: "510 kcal", category: "Strength" },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-transparent hover:border-white/10 hover:bg-white/10 transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Dumbbell className="text-primary w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold">{item.title}</p>
                  <p className="text-xs text-white/40">{item.time}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary">{item.energy}</p>
                <p className="text-xs text-white/40 uppercase font-bold tracking-tighter">{item.category}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
