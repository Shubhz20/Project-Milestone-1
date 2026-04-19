import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { motion } from "framer-motion";
import { User, Mail, Lock, Dumbbell, ShieldCheck, ArrowRight } from "lucide-react";
import { toast } from "react-hot-toast";

export const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(name, email, password);
      toast.success("Account initialized! Time to grind.");
      navigate("/", { replace: true });
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Visual Side */}
      <div className="hidden lg:flex relative overflow-hidden bg-bg-dark border-r border-white/5 p-20 flex-col justify-between">
        <div className="absolute inset-x-0 bottom-0 top-0 bg-gradient-to-tr from-primary/10 to-transparent" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop')] mix-blend-overlay opacity-20 grayscale brightness-50" />
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Dumbbell className="text-bg-dark w-7 h-7" />
          </div>
          <span className="font-extrabold text-2xl tracking-tighter">FITNESS<span className="text-primary">PRO</span></span>
        </div>

        <div className="relative z-10 space-y-6 max-w-lg">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-primary font-bold tracking-[0.2em] uppercase text-sm"
          >
            <ShieldCheck className="w-5 h-5" /> Secured Protocol
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl font-extrabold tracking-tighter"
          >
            Join the <br/><span className="text-primary">Elite League.</span>
          </motion.h2>
          <div className="grid grid-cols-2 gap-8 pt-8">
            <div>
              <p className="text-3xl font-bold">15k+</p>
              <p className="text-white/40 text-xs uppercase font-bold tracking-widest">Active Athletes</p>
            </div>
            <div>
              <p className="text-3xl font-bold">1M+</p>
              <p className="text-white/40 text-xs uppercase font-bold tracking-widest">Sessions Logged</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex items-center justify-center p-8 lg:p-20 relative bg-bg-dark/50 overflow-hidden">
        <div className="absolute top-[-20%] right-[-20%] w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full" />
        
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8 relative"
        >
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Create <span className="text-primary">Profile</span></h2>
            <p className="text-white/40">Register to unlock high-performance tracking tools.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/50 pl-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-3.5 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
                  <input
                    type="text" required
                    className="glass-input pl-12 w-full h-12"
                    placeholder="John Doe"
                    value={name} onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/50 pl-1">Target Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-3.5 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
                  <input
                    type="email" required
                    className="glass-input pl-12 w-full h-12"
                    placeholder="athlete@domain.pro"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/50 pl-1">Access Key</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-3.5 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
                  <input
                    type="password" required
                    className="glass-input pl-12 w-full h-12"
                    placeholder="Minimum 8 characters"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-12 glass-button bg-primary text-bg-dark hover:brightness-110 flex items-center justify-center gap-2 group"
            >
              Confirm Registration <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <p className="text-center text-sm text-white/40">
            Already registered?{" "}
            <Link to="/login" className="text-primary font-bold hover:underline">
              Enter Console
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};
