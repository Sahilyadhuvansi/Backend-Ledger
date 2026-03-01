import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Wallet, LogIn, Mail, Lock } from "lucide-react";

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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/20 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 blur-3xl rounded-full translate-x-1/2 translate-y-1/2 animate-pulse [animation-delay:2s]"></div>
      </div>

      <div className="w-full max-w-md glass-panel p-8 animate-fade-in">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 ring-1 ring-white/10 shadow-inner group">
            <Wallet className="w-10 h-10 text-indigo-500 group-hover:scale-110 transition-transform" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome Back
          </h1>
          <p className="text-slate-400 mt-2 text-center text-sm font-medium">
            Log in to manage your finances securely.
          </p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl mb-6 text-sm font-medium flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping"></div>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label>Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <input
                type="email"
                required
                className="w-full pl-11 focus:ring-2 focus:ring-indigo-500/20 border-white/5"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label>Password</label>
            <div className="relative group">
              <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <input
                type="password"
                required
                className="w-full pl-11 focus:ring-2 focus:ring-indigo-500/20 border-white/5"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary h-12 flex items-center justify-center gap-2 text-base shadow-indigo-500/10"
          >
            {loading ? (
              <div className="loading-spinner"></div>
            ) : (
              <LogIn className="w-5 h-5" />
            )}
            {loading ? "Authenticating..." : "Sign In Now"}
          </button>
        </form>

        <p className="text-center text-slate-500 mt-8 text-sm">
          New here?{" "}
          <Link
            to="/register"
            className="link text-indigo-400 font-bold hover:text-indigo-300"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
