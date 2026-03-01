import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LogIn,
  Mail,
  Lock,
  Fingerprint,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.message || "Verification failed. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 bg-[#030712] overflow-hidden selection:bg-indigo-500/30">
      {/* Dynamic Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full animate-pulse opacity-50"></div>
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full animate-pulse opacity-50"
          style={{ animationDelay: "2s" }}
        ></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05)_0%,transparent_70%)]"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-panel p-10 border border-white/10 backdrop-blur-2xl bg-white/[0.02] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col items-center mb-10 text-center">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.8, type: "spring" }}
              className="w-20 h-20 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-indigo-500/20 ring-1 ring-white/20"
            >
              <Fingerprint className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-4xl font-black text-white tracking-tighter mb-2">
              Secure{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                Ledger
              </span>
            </h1>
            <p className="text-slate-400 font-medium text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Enterprise-Grade Encryption
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-2xl mb-8 text-sm font-bold flex items-center gap-3 backdrop-blur-sm"
            >
              <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping"></div>
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">
                Access Protocol (Email)
              </label>
              <div className="relative group">
                <input
                  type="email"
                  required
                  placeholder="name@organization.com"
                  className="w-full h-14 pl-12 pr-4 bg-white/[0.03] border-white/5 focus:border-indigo-500/50 focus:bg-white/[0.05] rounded-2xl transition-all duration-300 text-sm font-medium outline-none text-white ring-offset-0 focus:ring-4 focus:ring-indigo-500/10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Mail className="absolute left-4 top-4 w-6 h-6 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">
                Verification Pin (Password)
              </label>
              <div className="relative group">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full h-14 pl-12 pr-4 bg-white/[0.03] border-white/5 focus:border-indigo-500/50 focus:bg-white/[0.05] rounded-2xl transition-all duration-300 text-sm font-medium outline-none text-white ring-offset-0 focus:ring-4 focus:ring-indigo-500/10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Lock className="absolute left-4 top-4 w-6 h-6 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full btn-primary h-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-2xl flex items-center justify-center gap-3 text-lg font-black shadow-2xl shadow-indigo-500/20 border-none mt-4 transition-all"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  <span>Initiate Login</span>
                </>
              )}
            </motion.button>
          </form>

          <div className="flex flex-col items-center mt-10 space-y-4">
            <p className="text-slate-500 text-sm font-medium">
              New here?{" "}
              <Link
                to="/register"
                className="text-indigo-400 hover:text-indigo-300 font-black tracking-tight transition-colors underline-offset-4 hover:underline"
              >
                Establish Account
              </Link>
            </p>
            <div className="flex items-center gap-2 opacity-30 grayscale hover:grayscale-0 transition-all cursor-default">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white">
                Quantum Secured v1.0
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
