import { motion } from "framer-motion";
import { 
  User as UserIcon, 
  Mail, 
  MapPin, 
  Scale, 
  Ruler, 
  Trophy, 
  Target,
  Medal,
  Award,
  Star,
  Camera,
  Heart
} from "lucide-react";
import { useState, useMemo } from "react";
import { useAuth } from "../auth/AuthContext";

export const ProfilePage = () => {
  const { user } = useAuth();
  const [weight, setWeight] = useState(75);
  const [height, setHeight] = useState(175);

  const bmi = useMemo(() => {
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  }, [weight, height]);

  const bmiCategory = useMemo(() => {
    const val = parseFloat(bmi);
    if (val < 18.5) return { label: "Underweight", color: "text-blue-400" };
    if (val < 25) return { label: "Healthy", color: "text-green-400" };
    if (val < 30) return { label: "Overweight", color: "text-orange-400" };
    return { label: "Obese", color: "text-red-400" };
  }, [bmi]);

  const achievements = [
    { title: "Early Bird", desc: "5 Workouts before 7 AM", icon: Star, color: "text-yellow-400", earned: true },
    { title: "Iron lungs", desc: "10km Monthly run", icon: Heart, color: "text-red-400", earned: true },
    { title: "Goal Crusher", desc: "Complete 10 goals", icon: Trophy, color: "text-primary", earned: true },
    { title: "Powerlifter", desc: "200kg Squat", icon: Award, color: "text-blue-400", earned: false },
    { title: "Commando", desc: "30-day streak", icon: Medal, color: "text-purple-400", earned: false },
  ];

  if (!user) return null;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header className="relative h-64 rounded-3xl overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-dark via-primary to-blue-400" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop')] mix-blend-overlay opacity-30 bg-cover bg-center" />
        
        <div className="absolute bottom-0 left-0 w-full p-8 flex items-end justify-between bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-xl border-4 border-white/20 flex items-center justify-center overflow-hidden">
                <UserIcon className="w-12 h-12 text-white" />
              </div>
              <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center border-2 border-black group-hover:scale-110 transition-transform">
                <Camera className="w-4 h-4 text-bg-dark" />
              </button>
            </div>
            <div>
              <h2 className="text-3xl font-bold">{user.name}</h2>
              <div className="flex items-center gap-4 text-white/70 text-sm mt-1">
                <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {user.email}</span>
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> San Francisco, CA</span>
              </div>
            </div>
          </div>
          <button className="glass-button bg-white/10 hover:bg-white/20 border-white/20">
            Edit Profile
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* BMI Calculator */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 glass-card p-8"
        >
          <div className="flex items-center gap-3 mb-8">
            <Scale className="text-primary w-6 h-6" />
            <h3 className="text-xl font-bold">BMI Calculator</h3>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-white/60">Weight</span>
                <span className="text-primary">{weight} kg</span>
              </div>
              <input 
                type="range" min="30" max="200" value={weight} 
                onChange={(e) => setWeight(parseInt(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-white/60">Height</span>
                <span className="text-primary">{height} cm</span>
              </div>
              <input 
                type="range" min="100" max="250" value={height} 
                onChange={(e) => setHeight(parseInt(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <div className="pt-8 border-t border-white/10 text-center">
              <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-1">Your Score</p>
              <div className="text-5xl font-extrabold mb-2">{bmi}</div>
              <p className={cn("font-bold text-lg", bmiCategory.color)}>{bmiCategory.label}</p>
            </div>
          </div>
        </motion.div>

        {/* Badges & Achievements */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 glass-card p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Trophy className="text-primary w-6 h-6" />
              <h3 className="text-xl font-bold">Achievements & Gamification</h3>
            </div>
            <p className="text-primary font-bold text-sm">Level 24 Athlete</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {achievements.map((item, i) => (
              <div 
                key={item.title}
                className={cn(
                  "p-4 rounded-2xl border flex items-center gap-4 transition-all group cursor-default",
                  item.earned 
                    ? "bg-white/5 border-white/10" 
                    : "bg-black/20 border-white/5 opacity-50 grayscale"
                )}
              >
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", item.earned ? "bg-primary/20" : "bg-white/5")}>
                  <item.icon className={cn("w-6 h-6", item.earned ? item.color : "text-white/20")} />
                </div>
                <div>
                  <h4 className="font-bold text-sm">{item.title}</h4>
                  <p className="text-xs text-white/50">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-primary/10 to-transparent border border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-sm">Elite Status Progress</h4>
              <p className="text-xs text-primary font-bold">85%</p>
            </div>
            <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
              <div className="w-[85%] h-full bg-gradient-to-r from-primary to-primary-dark" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
