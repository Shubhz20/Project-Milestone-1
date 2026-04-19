import { useEffect, useState } from "react";
import { goalsApi, programsApi } from "../api/endpoints";
import { Goal as IFitnessGoal } from "../api/types";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Target, 
  TrendingUp, 
  X, 
  Trophy,
  ArrowRight
} from "lucide-react";
import { toast } from "react-hot-toast";

export const GoalsPage = () => {
  const [goals, setGoals] = useState<IFitnessGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: "", targetValue: 0, unit: "kg" });

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const data = await goalsApi.list();
      setGoals(data);
    } catch (err) {
      toast.error("Failed to load goals");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let pgId = "";
      const existingProgs = await programsApi.list();
      if (existingProgs.length > 0) {
        pgId = existingProgs[0]._id;
      } else {
        const fallback = await programsApi.createFromTemplate("full-body-strength-foundations");
        pgId = fallback._id;
      }

      await goalsApi.create({ ...newGoal, programId: pgId });
      toast.success("Goal set! Time to focus.");
      setIsModalOpen(false);
      loadGoals();
    } catch (err) {
      toast.error("Failed to create goal");
    }
  };

  const handleAchieve = async (id: string) => {
    try {
      await goalsApi.markAchieved(id);
      loadGoals();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="space-y-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Focus <span className="text-primary">Objectives</span></h1>
          <p className="text-white/40 mt-1">Define your vision. Track your execution.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="glass-button bg-primary text-bg-dark flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> New Objective
        </button>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="glass-card h-64 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {goals.map((goal, index) => {
              const progress = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
              return (
                <motion.div
                  key={goal._id.toString()}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card p-8 flex flex-col justify-between group hover:border-primary/30 transition-all"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                        <Target className="text-primary w-6 h-6" />
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase font-bold tracking-widest text-white/30">Target</p>
                        <p className="text-lg font-extrabold">{goal.targetValue} <span className="text-xs text-white/50 font-normal">{goal.unit}</span></p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-xl font-bold">{goal.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-2 h-2 rounded-full bg-green-400" />
                        <span className="text-xs text-white/50 font-bold uppercase tracking-wider">{goal.isAchieved ? "Achieved" : "In Progress"}</span>
                      </div>
                    </div>

                    <div className="pt-4 space-y-2">
                      <div className="flex justify-between items-end">
                        <p className="text-xs font-bold text-white/30">Progress</p>
                        <p className="text-sm font-bold text-primary">{progress}%</p>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          className="h-full bg-gradient-to-r from-primary to-primary-dark" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                    <button 
                      onClick={() => handleAchieve(goal._id.toString())}
                      className="text-white/50 hover:text-primary transition-all flex items-center gap-2 text-sm font-bold"
                    >
                      <TrendingUp className="w-4 h-4" /> Finalize Goal
                    </button>
                    {progress === 100 && (
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        <Trophy className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-bg-dark/80 backdrop-blur-md">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card max-w-md w-full p-8 space-y-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] border-white/20"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">New <span className="text-primary">Objective</span></h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/50 hover:text-white transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/50 pl-1">Objective Title</label>
                  <input
                    type="text" required className="glass-input w-full h-12"
                    placeholder="e.g. Weight Loss Goal" value={newGoal.title}
                    onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-white/50 pl-1">Target</label>
                    <input
                      type="number" required className="glass-input w-full h-12"
                      value={newGoal.targetValue} onChange={e => setNewGoal({ ...newGoal, targetValue: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-white/50 pl-1">Unit</label>
                    <input
                      type="text" required className="glass-input w-full h-12"
                      value={newGoal.unit} onChange={e => setNewGoal({ ...newGoal, unit: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <button type="submit" className="w-full h-12 glass-button bg-primary text-bg-dark font-bold flex items-center justify-center gap-2 group">
                Commence Goal <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-all" />
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
