import { motion } from "framer-motion";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../core/context/AuthContext";
import {
  User,
  Mail,
  Lock,
  UserPlus,
  Fingerprint,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  /* ================= HANDLE INPUT ================= */

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setError("");

    try {
      await register(
        formData.name,
        formData.username,
        formData.email,
        formData.password,
      );

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || "Registration failed.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 w-full h-80 bg-gradient-to-b from-indigo-100/50 to-transparent pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/90 backdrop-blur-xl border border-slate-100 shadow-xl shadow-slate-200/50 rounded-3xl p-8 sm:p-12">
          {/* HEADER */}

          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30">
              <Fingerprint className="w-8 h-8 text-white" />
            </div>

            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
              Create Account
            </h1>

            <p className="text-slate-500 font-medium text-sm flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              Standard Security Protocol v1.2
            </p>
          </div>

          {/* ERROR */}

          {error && (
            <motion.div
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-8 text-sm font-semibold flex items-center gap-2"
            >
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              {error}
            </motion.div>
          )}

          {/* FORM */}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* NAME */}

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 ml-1">
                Full Name
              </label>

              <div className="relative group">
                <input
                  name="name"
                  type="text"
                  required
                  autoFocus
                  placeholder="Johnathan Doe"
                  className="input-field !pl-12"
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="name"
                />

                <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              </div>
            </div>

            {/* USERNAME */}

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 ml-1">
                Unique Username
              </label>

              <div className="relative group">
                <input
                  name="username"
                  type="text"
                  required
                  placeholder="johndoe123"
                  className="input-field !pl-12"
                  value={formData.username}
                  onChange={handleChange}
                  autoComplete="username"
                />

                <div className="absolute left-4 top-3.5 w-5 h-5 flex items-center justify-center font-bold text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  @
                </div>
              </div>
            </div>

            {/* EMAIL */}

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 ml-1">
                Primary Email
              </label>

              <div className="relative group">
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="john@organization.com"
                  className="input-field !pl-12"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />

                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              </div>
            </div>

            {/* PASSWORD */}

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 ml-1">
                Master Password
              </label>

              <div className="relative group">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="input-field !pl-12 !pr-12"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />

                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-slate-400 hover:text-indigo-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* BUTTON */}

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="btn-primary mt-4 py-3 h-14"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Bootstrap Account
                </>
              )}
            </motion.button>
          </form>

          {/* LOGIN LINK */}

          <p className="text-center text-slate-500 mt-8 text-sm font-medium">
            Already registered?{" "}
            <Link
              to="/login"
              className="text-indigo-600 hover:text-indigo-700 font-bold hover:underline"
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
