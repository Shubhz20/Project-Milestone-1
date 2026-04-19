import { motion } from "framer-motion";
import { 
  Plus, 
  Trash2, 
  Apple, 
  Coffee, 
  Pizza, 
  PieChart as PieChartIcon,
  Search
} from "lucide-react";
import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface Meal {
  id: string;
  name: string;
  calories: number;
  type: string;
}

export const DietPage = () => {
  const [meals, setMeals] = useState<Meal[]>([
    { id: "1", name: "Oatmeal with Blueberries", calories: 350, type: "Breakfast" },
    { id: "2", name: "Chicken Salad", calories: 520, type: "Lunch" },
  ]);
  const [newName, setNewName] = useState("");
  const [newCal, setNewCal] = useState("");

  const totalCals = meals.reduce((acc, curr) => acc + curr.calories, 0);
  const goal = 2400;

  const chartData = [
    { name: "Consumed", value: totalCals, color: "#00d2ff" },
    { name: "Remaining", value: Math.max(0, goal - totalCals), color: "rgba(255,255,255,0.05)" },
  ];

  const addMeal = () => {
    if (!newName || !newCal) return;
    setMeals([...meals, {
      id: Date.now().toString(),
      name: newName,
      calories: parseInt(newCal),
      type: "Meal"
    }]);
    setNewName("");
    setNewCal("");
  };

  const removeMeal = (id: string) => {
    setMeals(meals.filter(m => m.id !== id));
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">Diet <span className="text-primary">Tracking</span></h1>
        <p className="text-white/50 mt-1">Manage your calories and nutrition goals (Simulated).</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Add Meal Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <Plus className="text-primary w-6 h-6" />
              <h3 className="text-xl font-bold">Add New Entry</h3>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-white/20" />
                <input 
                  type="text" value={newName} onChange={e => setNewName(e.target.value)}
                  placeholder="What did you eat?" className="glass-input pl-10 w-full" 
                />
              </div>
              <input 
                type="number" value={newCal} onChange={e => setNewCal(e.target.value)}
                placeholder="Calories" className="glass-input w-full sm:w-32" 
              />
              <button onClick={addMeal} className="glass-button bg-primary text-bg-dark hover:brightness-110">
                Log Meal
              </button>
            </div>
          </motion.div>

          {/* Meal List */}
          <div className="space-y-4">
            {meals.map((meal) => (
              <motion.div 
                key={meal.id} layout
                className="glass-card p-6 flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                    {meal.type === "Breakfast" ? <Coffee className="w-6 h-6" /> : <Pizza className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className="font-bold">{meal.name}</h4>
                    <p className="text-xs text-white/40">{meal.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <span className="font-extrabold text-primary">{meal.calories} kcal</span>
                  <button onClick={() => removeMeal(meal.id)} className="text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-8 text-center"
          >
            <div className="flex items-center gap-3 justify-center mb-6">
              <PieChartIcon className="text-primary w-6 h-6" />
              <h3 className="text-xl font-bold">Calorie Breakdown</h3>
            </div>
            
            <div className="h-64 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: "rgba(0,0,0,0.8)", border: "none", borderRadius: "10px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-extrabold">{totalCals}</span>
                <span className="text-[10px] text-white/50 uppercase font-bold tracking-widest">Logged</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/10">
              <div className="text-left">
                <p className="text-white/40 text-[10px] font-bold uppercase">Goal</p>
                <p className="font-bold">{goal} kcal</p>
              </div>
              <div className="text-right">
                <p className="text-white/40 text-[10px] font-bold uppercase">Left</p>
                <p className="font-bold text-primary">{Math.max(0, goal - totalCals)} kcal</p>
              </div>
            </div>
          </motion.div>

          <div className="glass-card p-8 space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2"><Apple className="text-green-400 w-5 h-5" /> Nutrition Tips</h3>
            <div className="space-y-3">
              {[
                "Focus on protein intake for muscle recovery.",
                "Drink at least 3 liters of water today.",
                "Reduce processed sugar intake by 20%.",
              ].map((tip, i) => (
                <div key={i} className="flex gap-3 text-sm text-white/70">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <p>{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
