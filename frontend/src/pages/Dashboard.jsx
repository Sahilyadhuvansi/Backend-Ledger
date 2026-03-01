import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import {
  Plus,
  Wallet,
  Eye,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";

const Dashboard = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const { data } = await api.get("/accounts");
      setAccounts(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createAccount = async () => {
    try {
      setLoading(true);
      await api.post("/accounts", { currency: "INR" });
      fetchAccounts();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-fade-in">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            Financial Hub
          </h1>
          <p className="text-slate-400 mt-2 font-medium">
            Manage your accounts and track transactions in real-time.
          </p>
        </div>
        <button
          onClick={createAccount}
          className="btn-primary group flex items-center gap-2 pr-6"
        >
          <div className="bg-white/10 p-1.5 rounded-lg group-hover:bg-white/20 transition-colors">
            <Plus className="w-5 h-5" />
          </div>
          <span>New Account</span>
        </button>
      </header>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl flex items-center gap-3">
          <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></div>
          {error}
        </div>
      )}

      {loading && accounts.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="glass-panel h-56 animate-pulse bg-white/5 opacity-50"
            ></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {accounts.map((account, index) => (
            <div
              key={account._id}
              className="glass-panel p-8 group hover:-translate-y-2 transition-all duration-500 relative overflow-hidden flex flex-col justify-between min-h-[14rem]"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-indigo-500/20 transition-colors"></div>

              <div className="flex items-start justify-between">
                <div className="p-3 bg-indigo-500/10 rounded-2xl ring-1 ring-white/10 group-hover:ring-indigo-500/30 transition-all">
                  <Wallet className="w-7 h-7 text-indigo-400" />
                </div>
                <span
                  className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase ${
                    account.status === "active"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-slate-500/10 text-slate-400"
                  }`}
                >
                  {account.status}
                </span>
              </div>

              <div>
                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">
                  Balance
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-white">
                    {account.balance.toLocaleString()}
                  </span>
                  <span className="text-slate-500 font-bold">
                    {account.currency}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 mt-4 border-t border-white/5 pt-4">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Secured Vault</span>
                </div>
                <button
                  onClick={() => navigate(`/accounts/${account._id}`)}
                  className="flex items-center gap-1.5 text-indigo-400 hover:text-white transition-colors text-sm font-bold group/btn"
                >
                  Details
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}

          {accounts.length === 0 && !loading && (
            <div
              className="col-span-full py-24 glass-panel border-dashed border-2 flex flex-col items-center justify-center text-center group cursor-pointer"
              onClick={createAccount}
            >
              <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-10 h-10 text-slate-600 group-hover:text-indigo-500 transition-colors" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                No accounts found
              </h3>
              <p className="text-slate-400 max-w-xs px-4">
                Create your first account to start managing your daily ledger
                professionally.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
