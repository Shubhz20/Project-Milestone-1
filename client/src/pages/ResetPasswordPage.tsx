import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Key, ArrowRight } from "lucide-react";
import { toast } from "react-hot-toast";
import { authApi } from "../api/endpoints";
import { tokenStore } from "../api/client";

/**
 * ResetPasswordPage — step 2 of recovery.
 *
 * Accepts a reset token + new password, calls /api/auth/reset-password,
 * stores the returned JWT, and drops the user straight into the app.
 * Prefills the token from router state when the user arrived via the
 * "Continue to Reset Password" button on the forgot-password screen.
 */
export const ResetPasswordPage = () => {
  const location = useLocation() as { state?: { resetToken?: string } };
  const [resetToken, setResetToken] = useState(location.state?.resetToken ?? "");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirm) {
      toast.error("Passwords don't match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const { token, user } = await authApi.resetPassword(resetToken.trim(), newPassword);
      tokenStore.set(token);
      localStorage.setItem("fitness-tracker.user", JSON.stringify(user));
      toast.success(`Welcome back, ${user.name}!`);
      // Full reload so the AuthProvider reads the persisted user on mount.
      window.location.assign("/");
    } catch (err: any) {
      toast.error(err?.message || "Unable to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 lg:p-20 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary/5 blur-[120px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md space-y-8 relative"
      >
        <div className="space-y-2">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 mb-4">
            <Key className="text-bg-dark w-7 h-7" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight">
            Set a new <span className="text-primary">password</span>
          </h2>
          <p className="text-white/40">
            Paste your one-time reset token below and choose a new password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-white/50 pl-1">
              Reset Token
            </label>
            <div className="relative group">
              <Key className="absolute left-4 top-3.5 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                required
                className="glass-input pl-12 w-full h-12 font-mono text-xs"
                placeholder="paste your token"
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-white/50 pl-1">
              New Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
              <input
                type="password"
                required
                minLength={6}
                className="glass-input pl-12 w-full h-12"
                placeholder="at least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-white/50 pl-1">
              Confirm New Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
              <input
                type="password"
                required
                minLength={6}
                className="glass-input pl-12 w-full h-12"
                placeholder="repeat it"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 glass-button bg-primary text-bg-dark hover:brightness-110 flex items-center justify-center gap-2 group disabled:opacity-60"
          >
            {loading ? "Saving…" : "Reset Password & Sign In"}
            {!loading && (
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            )}
          </button>
        </form>

        <p className="text-center text-sm text-white/40">
          <Link to="/login" className="text-primary font-bold hover:underline">
            Back to Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
};
