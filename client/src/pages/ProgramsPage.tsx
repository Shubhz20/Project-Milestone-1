import { useEffect, useState } from "react";
import { programApi } from "../api/programApi";
import { IWorkoutProgram } from "../../src/models/WorkoutProgram";
import { motion } from "framer-motion";
import { 
  Rocket, 
  Map, 
  ChevronRight, 
  Flame, 
  Zap, 
  Plus, 
  Calendar,
  Lock,
  Star
} from "lucide-react";
import { toast } from "react-hot-toast";

export const ProgramsPage = () => {
  const [programs, setPrograms] = useState<IWorkoutProgram[]>([]);
  const [loading, setLoading] = useState(true);

  const featuredPrograms = [
    { title: "Alpha Protocol", desc: "Intense 8-week transformation for peak performance.", label: "Elite", icon: Zap, color: "text-yellow-400" },
    { title: "Vortex Cardio", desc: "High-metabolism engine building through interval training.", label: "Beginner", icon: Flame, color: "text-orange-500" },
  ];

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      const data = await programApi.getAll();
      setPrograms(data);
    } catch (err) {
      toast.error("Discovery service unavailable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Training <span className="text-primary">Protocols</span></h1>
          <p className="text-white/40 mt-1">Structured roadmaps for consistent long-term results.</p>
        </div>
        <button className="glass-button bg-white/5 border-white/10 hover:bg-white/10 flex items-center gap-2 text-sm">
          <Map className="w-4 h-4" /> My Roadmaps
        </button>
      </header>

      {/* Hero Section / Featured */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {featuredPrograms.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="group relative h-64 rounded-3xl overflow-hidden glass-card cursor-pointer border-transparent hover:border-primary/50 transition-all shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-all" />
            <div className="absolute top-6 right-6 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-extrabold uppercase tracking-widest border border-white/10">
              {p.label}
            </div>
            
            <div className="absolute bottom-8 left-8 right-8 space-y-2">
              <div className="flex items-center gap-3">
                <p className="text-xs font-bold text-primary uppercase tracking-widest">Featured Roadmap</p>
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              </div>
              <h3 className="text-3xl font-extrabold">{p.title}</h3>
              <p className="text-sm text-white/50 max-w-sm line-clamp-1">{p.desc}</p>
            </div>

            <div className="absolute bottom-8 right-8 w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
              <ChevronRight className="w-6 h-6 text-primary" />
            </div>
          </motion.div>
        ))}
      </section>

      {/* Main List */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Rocket className="text-primary w-5 h-5" /> Active Directory
          </h3>
          <div className="flex gap-2">
            <button className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"><Plus className="w-4 h-4" /></button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => <div key={i} className="glass-card h-24 animate-pulse uppercase" />)}
          </div>
        ) : (
          <div className="space-y-4">
            {programs.length > 0 ? (
              programs.map((program, index) => (
                <motion.div
                  key={program._id.toString()}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card flex items-center justify-between p-6 hover:bg-white/5 transition-all group"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:border-primary/20 transition-all">
                      <Star className="w-6 h-6 text-white/20 group-hover:text-primary transition-all" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{program.name}</h4>
                      <p className="text-xs text-white/40">{program.description || "Experimental training methodology."}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8">
                    <div className="hidden sm:flex flex-col items-end">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white/50 uppercase tracking-widest">
                        <Calendar className="w-3 h-3 text-primary" /> Duration
                      </div>
                      <p className="font-bold text-sm">4 Weeks</p>
                    </div>
                    <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary hover:text-bg-dark transition-all">
                      <Lock className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="glass-card p-16 text-center space-y-4">
                <p className="text-white/30 text-sm">Deployment ready. Select a roadmap to begin.</p>
                <div className="w-full h-px bg-white/5 max-w-[200px] mx-auto" />
                <p className="text-gray-600 uppercase text-[10px] font-bold tracking-[0.3em]">No custom protocols found</p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
