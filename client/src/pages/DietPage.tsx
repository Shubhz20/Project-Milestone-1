import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Trash2, 
  Apple, 
  Coffee, 
  Pizza,
  Salad,
  PieChart as PieChartIcon,
  Search,
  Flame,
  Target
} from "lucide-react";
import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { toast } from "react-hot-toast";

const STORAGE_KEY = "fitness-tracker.diet";

interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  type: string;
  loggedAt: string;
}

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];

const getMealIcon = (type: string) => {
  if (type === "Breakfast") return Coffee;
  if (type === "Lunch") return Salad;
  if (type === "Dinner") return Pizza;
  return Apple;
};

const loadFromStorage = (): Meal[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: Meal[] = JSON.parse(raw);
    // Only keep meals logged today
    const today = new Date().toDateString();
    return parsed.filter((m) => new Date(m.loggedAt).toDateString() === today);
  } catch {
    return [];
  }
};

export const DietPage = () => {
  const [meals, setMeals] = useState<Meal[]>(loadFromStorage);
  const [newName, setNewName] = useState("");
  const [newCal, setNewCal] = useState("");
  const [newProtein, setNewProtein] = useState("");
  const [mealType, setMealType] = useState("Breakfast");
  const [calorieGoal, setCalorieGoal] = useState(() => {
    return parseInt(localStorage.getItem("fitness-tracker.calorie-goal") || "2400");
  });

  // Persist meals to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(meals));
  }, [meals]);

  const totalCals = meals.reduce((acc, curr) => acc + curr.calories, 0);
  const totalProtein = meals.reduce((acc, curr) => acc + (curr.protein || 0), 0);
  const remaining = Math.max(0, calorieGoal - totalCals);
  const progressPct = Math.min(100, Math.round((totalCals / calorieGoal) * 100));

  const chartData = [
    { name: "Consumed", value: totalCals, color: totalCals > calorieGoal ? "#f87171" : "#00d2ff" },
    { name: "Remaining", value: remaining, color: "rgba(255,255,255,0.05)" },
  ];

  const addMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newCal) return;
    const cal = parseInt(newCal);
    if (isNaN(cal) || cal <= 0) {
      toast.error("Enter a valid calorie amount.");
      return;
    }
    const meal: Meal = {
      id: Date.now().toString(),
      name: newName.trim(),
      calories: cal,
      protein: parseInt(newProtein) || 0,
      type: mealType,
      loggedAt: new Date().toISOString(),
    };
    setMeals((prev) => [...prev, meal]);
    setNewName("");
    setNewCal("");
    setNewProtein("");
    toast.success(`"${meal.name}" logged!`);
  };

  const removeMeal = (id: string) => {
    setMeals((prev) => {
      const meal = prev.find((m) => m.id === id);
      const updated = prev.filter((m) => m.id !== id);
      if (meal) toast.success(`"${meal.name}" removed.`);
      return updated;
    });
  };

  const clearAll = () => {
    setMeals([]);
    toast.success("Today's log cleared.");
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Diet <span className="text-primary">Tracking</span></h1>
          <p className="text-white/50 mt-1">Logged meals persist across page refreshes.</p>
        </div>
        {meals.length > 0 && (
          <button
            onClick={clearAll}
            className="text-xs text-white/40 hover:text-red-400 transition-colors font-bold border border-white/10 hover:border-red-400/30 px-3 py-2 rounded-xl"
          >
            Clear Today
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Add Meal Form */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <Plus className="text-primary w-6 h-6" />
              <h3 className="text-xl font-bold">Log a Meal</h3>
            </div>
            <form onSubmit={addMeal} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3.5 w-5 h-5 text-white/20" />
                  <input 
                    type="text" value={newName} onChange={e => setNewName(e.target.value)}
                    placeholder="What did you eat?" className="glass-input pl-10 w-full" required
                  />
                </div>
                <select
                  value={mealType}
                  onChange={e => setMealType(e.target.value)}
                  className="glass-input w-full sm:w-36 bg-transparent"
                >
                  {MEAL_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <input 
                  type="number" value={newCal} onChange={e => setNewCal(e.target.value)}
                  placeholder="Calories (kcal)" className="glass-input flex-1" min={1} required
                />
                <input 
                  type="number" value={newProtein} onChange={e => setNewProtein(e.target.value)}
                  placeholder="Protein (g) — optional" className="glass-input flex-1" min={0}
                />
                <button type="submit" className="glass-button bg-primary text-bg-dark hover:brightness-110 flex items-center gap-2 font-bold">
                  <Plus className="w-4 h-4" /> Log
                </button>
              </div>
            </form>
          </motion.div>

          {/* Meal List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white/60 uppercase text-xs tracking-widest">
                Today's Meals ({meals.length})
              </h3>
            </div>

            {meals.length === 0 ? (
              <div className="glass-card p-12 text-center space-y-3">
                <div className="w-14 h-14 mx-auto rounded-full bg-white/5 flex items-center justify-center">
                  <Apple className="w-7 h-7 text-white/20" />
                </div>
                <p className="text-white/40 text-sm">No meals logged yet today.<br />Add your first meal above.</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {meals.map((meal) => {
                  const Icon = getMealIcon(meal.type);
                  return (
                    <motion.div 
                      key={meal.id}
                      layout
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 40, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      className="glass-card p-5 flex items-center justify-between hover:bg-white/5 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5 text-primary/70" />
                        </div>
                        <div>
                          <h4 className="font-bold">{meal.name}</h4>
                          <div className="flex items-center gap-3 mt-0.5">
                            <p className="text-xs text-white/40">{meal.type}</p>
                            {meal.protein > 0 && (
                              <p className="text-xs text-green-400/80 font-semibold">{meal.protein}g protein</p>
                            )}
                            <p className="text-xs text-white/30">
                              {new Date(meal.loggedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-extrabold text-primary">{meal.calories} <span className="text-xs font-normal text-white/40">kcal</span></span>
                        {/* Always-visible delete button, not hover-gated */}
                        <button
                          onClick={() => removeMeal(meal.id)}
                          className="w-9 h-9 rounded-xl bg-red-500/5 border border-red-500/10 flex items-center justify-center text-red-400/60 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-all shrink-0"
                          title="Remove meal"
                          type="button"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Calorie Ring */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-8 text-center"
          >
            <div className="flex items-center gap-3 justify-center mb-6">
              <PieChartIcon className="text-primary w-6 h-6" />
              <h3 className="text-xl font-bold">Calorie Breakdown</h3>
            </div>
            
            <div className="h-56 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: "rgba(0,0,0,0.85)", border: "none", borderRadius: "10px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-4xl font-extrabold">{totalCals}</span>
                <span className="text-[10px] text-white/50 uppercase font-bold tracking-widest">kcal logged</span>
                <span className={`text-xs font-bold mt-1 ${progressPct >= 100 ? "text-red-400" : "text-primary"}`}>
                  {progressPct}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/10">
              <div className="text-center">
                <p className="text-white/40 text-[10px] font-bold uppercase mb-1">Goal</p>
                <p className="font-bold text-sm">{calorieGoal}</p>
              </div>
              <div className="text-center">
                <p className="text-white/40 text-[10px] font-bold uppercase mb-1">Left</p>
                <p className={`font-bold text-sm ${remaining === 0 ? "text-red-400" : "text-primary"}`}>{remaining}</p>
              </div>
              <div className="text-center">
                <p className="text-white/40 text-[10px] font-bold uppercase mb-1">Protein</p>
                <p className="font-bold text-sm text-green-400">{totalProtein}g</p>
              </div>
            </div>
          </motion.div>

          {/* Set Calorie Goal */}
          <div className="glass-card p-6 space-y-3">
            <h3 className="font-bold flex items-center gap-2 text-sm">
              <Target className="text-primary w-4 h-4" /> Daily Calorie Goal
            </h3>
            <div className="flex gap-3">
              <input
                type="number"
                defaultValue={calorieGoal}
                min={500}
                max={10000}
                className="glass-input flex-1"
                onBlur={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val) && val > 0) {
                    setCalorieGoal(val);
                    localStorage.setItem("fitness-tracker.calorie-goal", String(val));
                    toast.success("Calorie goal updated!");
                  }
                }}
              />
              <span className="flex items-center text-white/40 text-sm font-bold">kcal</span>
            </div>
          </div>

          {/* Nutrition Tips */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="font-bold flex items-center gap-2"><Apple className="text-green-400 w-4 h-4" /> Nutrition Tips</h3>
            <div className="space-y-3">
              {[
                { tip: "Aim for 1.6–2.2g protein per kg bodyweight.", icon: Flame, color: "text-orange-400" },
                { tip: "Drink 2–3 liters of water throughout the day.", icon: Target, color: "text-blue-400" },
                { tip: "Front-load calories — eat bigger meals earlier.", icon: Apple, color: "text-green-400" },
              ].map((item) => (
                <div key={item.tip} className="flex gap-3 text-sm text-white/60 items-start">
                  <item.icon className={`w-4 h-4 ${item.color} shrink-0 mt-0.5`} />
                  <p>{item.tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
