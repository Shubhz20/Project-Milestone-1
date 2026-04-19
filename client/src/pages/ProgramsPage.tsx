import { useEffect, useState } from "react";
import { programsApi } from "../api/endpoints";
import { Program as IWorkoutProgram } from "../api/types";
import { dataCache } from "../api/cache";
import { useAuth } from "../auth/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Rocket, 
  ChevronRight, 
  Flame, 
  Zap, 
  Plus, 
  Calendar,
  Trash2,
  CheckCircle2,
  X
} from "lucide-react";
import { toast } from "react-hot-toast";

const CACHE_KEY = "programs";

const TEMPLATE_CATALOG = [
  { key: "full-body-strength-foundations", name: "Alpha Protocol", label: "Elite", desc: "Compound lifts 3x/week with linear progression. Builds strength fast.", icon: Zap, color: "text-yellow-400" },
  { key: "hiit-fat-burner", name: "Vortex Cardio", label: "Beginner", desc: "Tabata-style HIIT circuits that maximise calorie burn per minute.", icon: Flame, color: "text-orange-500" },
  { key: "couch-to-5k", name: "Couch to 5K", label: "Beginner", desc: "9-week cardio progression from walking to a 5k run.", icon: Rocket, color: "text-blue-400" },
  { key: "yoga-mobility-flow", name: "Yoga Flow", label: "Flexible", desc: "Vinyasa flows for joint mobility, breath, and active recovery.", icon: CheckCircle2, color: "text-green-400" },
];

export const ProgramsPage = () => {
  const { user } = useAuth();
  const [programs, setPrograms] = useState<IWorkoutProgram[]>(() => {
    if (user) return dataCache.get<IWorkoutProgram[]>(user.id, CACHE_KEY) ?? [];
    return [];
  });
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    setLoading(true);
    try {
      const data = await programsApi.list();
      setPrograms(data);
      if (user) dataCache.set(user.id, CACHE_KEY, data);
    } catch {
      if (programs.length === 0) toast.error("Could not load your programs.");
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (templateKey: string, name: string) => {
    try {
      const created = await programsApi.createFromTemplate(templateKey);
      toast.success(`Enrolled in "${name}"!`);
      const updated = [...programs, created];
      setPrograms(updated);
      if (user) dataCache.set(user.id, CACHE_KEY, updated);
      loadPrograms();
    } catch {
      toast.error("Failed to enroll — you may already be in this program.");
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await programsApi.remove(id);
      const updated = programs.filter((p) => p._id !== id);
      setPrograms(updated);
      if (user) dataCache.set(user.id, CACHE_KEY, updated);
      toast.success("Program removed.");
    } catch {
      toast.error("Failed to delete program.");
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Training <span className="text-primary">Protocols</span></h1>
          <p className="text-white/40 mt-1">Structured roadmaps for consistent long-term results.</p>
        </div>
      </header>

      {/* Template Catalog */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Rocket className="text-primary w-5 h-5" /> Enroll in a Roadmap
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TEMPLATE_CATALOG.map((p, i) => (
            <motion.div
              key={p.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="group relative rounded-3xl overflow-hidden glass-card cursor-pointer border-transparent hover:border-primary/40 transition-all p-8 flex flex-col justify-between gap-4"
            >
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center`}>
                  <p.icon className={`w-6 h-6 ${p.color}`} />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-white/10 border border-white/10">
                  {p.label}
                </span>
              </div>
              <div>
                <h3 className="text-2xl font-extrabold">{p.name}</h3>
                <p className="text-sm text-white/50 mt-1 line-clamp-2">{p.desc}</p>
              </div>
              <button
                onClick={() => handleEnroll(p.key, p.name)}
                className="w-full glass-button bg-white/5 hover:bg-primary hover:text-bg-dark border-white/10 flex items-center justify-center gap-2 transition-all font-bold mt-2"
              >
                <Plus className="w-4 h-4" /> Enroll Now <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Active Programs */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <CheckCircle2 className="text-green-400 w-5 h-5" /> My Active Programs
          </h3>
          <span className="text-xs text-white/40 font-bold">{programs.length} enrolled</span>
        </div>

        {loading && programs.length === 0 ? (
          <div className="space-y-4">
            {[1, 2].map((i) => <div key={i} className="glass-card h-24 animate-pulse" />)}
          </div>
        ) : programs.length === 0 ? (
          <div className="glass-card p-16 text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-white/5 flex items-center justify-center">
              <Rocket className="w-8 h-8 text-white/20" />
            </div>
            <h4 className="font-bold text-lg">No programs yet</h4>
            <p className="text-white/40 text-sm max-w-sm mx-auto">Enroll in a roadmap above to get started on your fitness journey.</p>
          </div>
        ) : (
          <AnimatePresence>
            <div className="space-y-4">
              {programs.map((program, index) => (
                <motion.div
                  key={program._id.toString()}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card flex items-center justify-between p-6 hover:bg-white/5 transition-all group border border-transparent hover:border-white/10"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{program.name}</h4>
                      <div className="flex items-center gap-3 mt-1 text-xs text-white/40 font-medium">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-primary" /> {new Date(program.createdAt).toLocaleDateString()}</span>
                        <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/5 capitalize">{program.category}</span>
                      </div>
                      {program.description && (
                        <p className="text-xs text-white/30 mt-1 max-w-sm line-clamp-1">{program.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {confirmDeleteId === program._id.toString() ? (
                      <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                        <p className="text-xs text-red-400 font-bold">Delete?</p>
                        <button
                          onClick={() => handleDelete(program._id.toString())}
                          disabled={deletingId === program._id.toString()}
                          className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors"
                        >
                          {deletingId === program._id.toString() ? "..." : "Yes"}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="text-white/40 hover:text-white transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(program._id.toString())}
                        className="w-10 h-10 rounded-xl bg-red-500/5 border border-red-500/10 flex items-center justify-center text-red-400/50 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all opacity-0 group-hover:opacity-100"
                        title="Delete program"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </section>
    </div>
  );
};
