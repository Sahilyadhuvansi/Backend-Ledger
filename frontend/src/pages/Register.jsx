import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  User,
  Mail,
  Lock,
  UserPlus,
  Fingerprint,
  ShieldCheck,
} from "lucide-react";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await register(formData.name, formData.email, formData.password);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Registration failed. System could not verify details.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 bg-[#030712] overflow-hidden selection:bg-rose-500/30">
      {/* Dynamic Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-600/10 blur-[120px] rounded-full animate-pulse opacity-50"></div>
        <div
          className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse opacity-50"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-panel p-10 sm:p-12 border border-white/10 backdrop-blur-2xl bg-white/[0.04] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] rounded-2xl">
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-20 h-20 bg-gradient-to-tr from-rose-500 to-orange-500 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-rose-500/20 ring-1 ring-white/20">
              <Fingerprint className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter mb-2">
              Create Account
            </h1>
            <p className="text-slate-400 font-medium text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Standard Security Protocol v1.2
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-2xl mb-8 text-sm font-bold flex items-center gap-3 backdrop-blur-sm"
            >
              <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping"></div>
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">
                Identity (Full Name)
              </label>
              <div className="relative group">
                <input
                  type="text"
                  required
                  placeholder="Johnathan Doe"
                  className="w-full h-14 pl-12 pr-4 bg-white/[0.03] border-white/5 focus:border-rose-500/50 focus:bg-white/[0.05] rounded-2xl transition-all duration-300 text-sm font-medium outline-none text-white ring-offset-0 focus:ring-4 focus:ring-rose-500/10"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                <User className="absolute left-4 top-4 w-6 h-6 text-slate-600 group-focus-within:text-rose-400 transition-colors" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">
                Primary Email
              </label>
              <div className="relative group">
                <input
                  type="email"
                  required
                  placeholder="john@organization.com"
                  className="w-full h-14 pl-12 pr-4 bg-white/[0.03] border-white/5 focus:border-rose-500/50 focus:bg-white/[0.05] rounded-2xl transition-all duration-300 text-sm font-medium outline-none text-white ring-offset-0 focus:ring-4 focus:ring-rose-500/10"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
                <Mail className="absolute left-4 top-4 w-6 h-6 text-slate-600 group-focus-within:text-rose-400 transition-colors" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">
                Master Password
              </label>
              <div className="relative group">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full h-14 pl-12 pr-4 bg-white/[0.03] border-white/5 focus:border-rose-500/50 focus:bg-white/[0.05] rounded-2xl transition-all duration-300 text-sm font-medium outline-none text-white ring-offset-0 focus:ring-4 focus:ring-rose-500/10"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <Lock className="absolute left-4 top-4 w-6 h-6 text-slate-600 group-focus-within:text-rose-400 transition-colors" />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full btn-primary h-14 bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 rounded-2xl flex items-center justify-center gap-3 text-lg font-black shadow-2xl shadow-rose-500/20 border-none mt-4 transition-all"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <UserPlus className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  <span>Bootstrap Account</span>
                </>
              )}
            </motion.button>
          </form>

          <p className="text-center text-slate-500 mt-10 text-sm font-medium">
            Already registered?{" "}
            <Link
              to="/login"
              className="text-rose-400 hover:text-rose-300 font-black tracking-tight transition-colors underline-offset-4 hover:underline"
            >
              Verify Identity
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
