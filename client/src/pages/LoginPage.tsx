import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { motion } from "framer-motion";
import { Dumbbell, Mail, Lock, ArrowRight, Github } from "lucide-react";
import { toast } from "react-hot-toast";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      toast.success("Welcome back, athlete!");
      navigate("/", { replace: true });
    } catch (err: any) {
      toast.error(err.message || "Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-bg-dark border-r border-white/5 items-center justify-center p-20">
        <div className="absolute inset-x-0 bottom-0 top-0 bg-gradient-to-tr from-primary/10 to-transparent" />
        <div className="absolute top-[20%] right-[10%] w-64 h-64 bg-primary/20 blur-[120px] rounded-full animate-pulse" />
        
        <div className="relative space-y-8 max-w-lg z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/20"
          >
            <Dumbbell className="text-bg-dark w-10 h-10" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl font-extrabold leading-tight tracking-tighter"
          >
            Elevate Your <span className="text-primary italic">Performance.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 text-lg leading-relaxed"
          >
            The world's most advanced fitness tracking platform for athletes who demand excellence. Track, analyze, and crush your goals.
          </motion.p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-20 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/5 blur-[120px] rounded-full" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md space-y-8 relative"
        >
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Access <span className="text-primary">Console</span></h2>
            <p className="text-white/40">Enter your credentials to continue your journey.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/50 pl-1">Email Terminal</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-3.5 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
                  <input
                    type="email"
                    required
                    className="glass-input pl-12 w-full h-12"
                    placeholder="name@athlete.pro"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between pl-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/50">Secure Key</label>
                  <a href="#" className="text-xs text-primary hover:underline">Forgot?</a>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-3.5 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
                  <input
                    type="password"
                    required
                    className="glass-input pl-12 w-full h-12"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-12 glass-button bg-primary text-bg-dark hover:brightness-110 flex items-center justify-center gap-2 group"
            >
              Initialize Session <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-bg-dark px-2 text-white/30 backdrop-blur-3xl">Or continue with</span></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="h-12 glass-button border-white/5 bg-white/5 hover:bg-white/10 flex items-center justify-center gap-2">
              <Github className="w-5 h-5" /> GitHub
            </button>
            <button className="h-12 glass-button border-white/5 bg-white/5 hover:bg-white/10 flex items-center justify-center gap-2">
              <div className="w-5 h-5 rounded-full border-2 border-primary" /> Google
            </button>
          </div>

          <p className="text-center text-sm text-white/40">
            Internal candidate?{" "}
            <Link to="/register" className="text-primary font-bold hover:underline">
              Request Access
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};
