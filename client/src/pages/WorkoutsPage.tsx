import React, { useEffect, useState } from "react";
import { workoutApi } from "../api/workoutApi";
import { IWorkoutSession } from "../../src/models/WorkoutSession";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Dumbbell, 
  Clock, 
  CheckCircle2, 
  Timer, 
  ArrowRight,
  TrendingUp,
  ChevronDown
} from "lucide-react";
import { toast } from "react-hot-toast";

export const WorkoutsPage = () => {
  const [workouts, setWorkouts] = useState<IWorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [workoutType, setWorkoutType] = useState("Strength");

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    try {
      const data = await workoutApi.getAll();
      setWorkouts(data);
    } catch (err) {
      toast.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  const handleStartWorkout = async () => {
    try {
      await workoutApi.start({ type: workoutType } as any);
      toast.success("Workout session initialized!");
      loadWorkouts();
    } catch (err) {
      toast.error("An session is already active");
    }
  };

  const handleEndWorkout = async (id: string) => {
    try {
      await workoutApi.end(id, { notes: "Completed with high intensity" } as any);
      toast.success("Session achieved!");
      loadWorkouts();
    } catch (err) {
      toast.error("Failed to conclude session");
    }
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Workout <span className="text-primary">Sessions</span></h1>
          <p className="text-white/40 mt-1">Consistency is the bridge between goals and achievement.</p>
        </div>
        
        <div className="flex gap-4">
          <select 
            value={workoutType} 
            onChange={e => setWorkoutType(e.target.value)}
            className="glass-input bg-transparent min-w-[140px]"
          >
            <option>Strength</option>
            <option>Cardio</option>
            <option>HIIT</option>
            <option>Yoga</option>
          </select>
          <button 
            onClick={handleStartWorkout}
            className="glass-button bg-primary text-bg-dark flex items-center gap-2 hover:translate-y-[-2px] shadow-lg shadow-primary/20"
          >
            <Plus className="w-5 h-5 font-bold" /> New Session
          </button>
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="glass-card h-48 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Active / Recent Column */}
          <div className="xl:col-span-2 space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
              <Timer className="text-primary w-5 h-5" /> Activity Log
            </h3>
            
            <AnimatePresence mode="popLayout">
              {workouts.length > 0 ? (
                workouts.map((workout, index) => (
                  <motion.div
                    key={workout._id.toString()}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="glass-card group relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-6 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center gap-6">
                      <div className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center relative",
                        !workout.endTime ? "bg-primary/20 animate-pulse" : "bg-white/5"
                      )}>
                        <Dumbbell className={cn("w-8 h-8", !workout.endTime ? "text-primary" : "text-white/30")} />
                        {!workout.endTime && <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-bg-dark" />}
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xl font-bold capitalize">{workout.type} Session</h4>
                          {!workout.endTime && <span className="bg-primary/10 text-primary text-[10px] font-bold uppercase py-0.5 px-2 rounded-full tracking-widest">Live Now</span>}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-white/40 font-medium">
                          <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {new Date(workout.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(workout.startTime).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-8 pt-4 sm:pt-0 border-t sm:border-t-0 border-white/5">
                      <div className="text-right">
                        <p className="text-xs text-white/30 uppercase font-bold tracking-widest mb-0.5">Energy Burn</p>
                        <p className="text-xl font-extrabold text-white">450 <span className="text-xs text-white/50 font-normal">kcal</span></p>
                      </div>
                      
                      {!workout.endTime ? (
                        <button 
                          onClick={() => handleEndWorkout(workout._id.toString())}
                          className="glass-button bg-white group-hover:bg-primary text-bg-dark transition-all px-6"
                        >
                          Conclude
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 text-green-400 font-bold text-sm bg-green-400/5 py-2 px-4 rounded-xl border border-green-400/10">
                          <CheckCircle2 className="w-4 h-4" /> Finalized
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="glass-card p-20 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                    <Dumbbell className="w-10 h-10 text-white/10" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">No sessions logged yet</h3>
                    <p className="text-white/40 mt-1 max-w-sm ml-auto mr-auto">Your journey starts here. Press 'New Session' to begin tracking your athletic progress.</p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Stats Column */}
          <div className="space-y-8">
            <div className="glass-card p-8 bg-gradient-to-br from-primary/10 to-transparent">
              <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
                <TrendingUp className="text-primary w-6 h-6" /> Motivation Hub
              </h3>
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-white/60 italic leading-relaxed">"The only bad workout is the one that didn't happen."</p>
                </div>
                
                <div className="space-y-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-white/40">Weekly Performance</p>
                  <div className="flex justify-between items-end gap-1 h-20">
                    {[3, 5, 2, 8, 4, 6, 7].map((h, i) => (
                      <div key={i} className="flex-1 bg-white/5 rounded-t-lg relative group">
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: `${h * 10}%` }}
                          className={cn(
                            "absolute bottom-0 left-0 right-0 rounded-t-lg transition-all",
                            i === 6 ? "bg-primary shadow-[0_0_20px_rgba(0,210,255,0.3)]" : "bg-white/10 group-hover:bg-white/20"
                          )}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Total Duration</span>
                    <span className="font-bold">12.5 hrs</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Avg Intenstity</span>
                    <span className="font-bold text-primary">85%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card p-8 group cursor-pointer hover:bg-white/5 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center">
                  <ArrowRight className="text-orange-500 w-5 h-5 rotate-[-45deg]" />
                </div>
                <ChevronDown className="w-5 h-5 text-white/20 group-hover:text-white transition-all" />
              </div>
              <h4 className="font-bold">Personal Record Found!</h4>
              <p className="text-sm text-white/50 mt-1">You lifted 5kg more in Squats today. Keep pushing!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
