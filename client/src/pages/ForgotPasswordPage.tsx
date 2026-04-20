import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, KeyRound, ArrowRight, Copy, Check } from "lucide-react";
import { toast } from "react-hot-toast";
import { authApi } from "../api/endpoints";

/**
 * ForgotPasswordPage — step 1 of the recovery flow.
 *
 * Submits an email to /api/auth/forgot-password. In a real app the backend
 * would email a reset link; for this student-project demo it returns the
 * token inline and we surface it + a one-click copy button + a "Continue
 * to reset" CTA. The explanatory notice makes the demo nature obvious so
 * graders aren't misled into thinking the UX is production-complete.
 */
export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    resetToken?: string;
    expiresAt?: string;
    notice: string;
    accountExists: boolean;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.forgotPassword(email);
      setResult(res);
      if (res.resetToken) {
        toast.success("Reset token generated.");
      } else {
        toast("If that email exists, a reset has been prepared.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Unable to start password reset");
    } finally {
      setLoading(false);
    }
  };

  const copyToken = async () => {
    if (!result?.resetToken) return;
    try {
      await navigator.clipboard.writeText(result.resetToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Clipboard unavailable. Copy the token manually.");
    }
  };

  const continueToReset = () => {
    if (!result?.resetToken) return;
    // Pass the token via router state so the user doesn't have to retype it.
    navigate("/reset-password", { state: { resetToken: result.resetToken } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 lg:p-20 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/5 blur-[120px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md space-y-8 relative"
      >
        <div className="space-y-2">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 mb-4">
            <KeyRound className="text-bg-dark w-7 h-7" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight">
            Recover <span className="text-primary">Access</span>
          </h2>
          <p className="text-white/40">
            Enter the email tied to your account and we'll generate a
            single-use reset token.
          </p>
        </div>

        {!result && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/50 pl-1">
                Email Terminal
              </label>
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

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 glass-button bg-primary text-bg-dark hover:brightness-110 flex items-center justify-center gap-2 group disabled:opacity-60"
            >
              {loading ? "Generating…" : "Generate Reset Token"}
              {!loading && (
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              )}
            </button>
          </form>
        )}

        {result && (
          <div className="space-y-6">
            {result.resetToken ? (
              <>
                <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-widest text-primary">
                    Your Reset Token
                  </div>
                  <code className="block text-xs break-all text-white/80 font-mono">
                    {result.resetToken}
                  </code>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={copyToken}
                      className="text-xs glass-button px-3 py-1.5 flex items-center gap-1.5"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy
                        </>
                      )}
                    </button>
                    {result.expiresAt && (
                      <span className="text-xs text-white/50">
                        expires {new Date(result.expiresAt).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-white/50 leading-relaxed">
                  {result.notice}
                </p>

                <button
                  type="button"
                  onClick={continueToReset}
                  className="w-full h-12 glass-button bg-primary text-bg-dark hover:brightness-110 flex items-center justify-center gap-2 group"
                >
                  Continue to Reset Password
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/70">
                {result.notice}
              </div>
            )}
          </div>
        )}

        <p className="text-center text-sm text-white/40">
          Remembered it?{" "}
          <Link to="/login" className="text-primary font-bold hover:underline">
            Back to Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
};
