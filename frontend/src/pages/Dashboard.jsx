import { motion } from "framer-motion";
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import {
  Plus,
  Wallet,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";

const Dashboard = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchAccounts = useCallback(async () => {
    try {
      const { data } = await api.get("/accounts");
      setAccounts(data.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const createAccount = async () => {
    try {
      setLoading(true);
      await api.post("/accounts", { currency: "INR" });
      await fetchAccounts();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">
            Financial Hub
          </h1>
          <p className="text-slate-400 font-medium tracking-tight">
            Manage your digital assets and track transaction flows in real-time.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={createAccount}
          className="btn-primary group flex items-center gap-2 pr-6 shadow-2xl shadow-indigo-500/20"
        >
          <div className="bg-white/20 p-1.5 rounded-lg">
            <Plus className="w-5 h-5" />
          </div>
          <span className="font-bold">New Account</span>
        </motion.button>
      </header>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl flex items-center gap-3"
          >
            <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></div>
            <span className="font-bold">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {loading && accounts.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-56 rounded-3xl animate-pulse bg-white/5 border border-white/5 shadow-inner"
            ></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {accounts.map((account, index) => (
            <motion.div
              key={account._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="p-8 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all relative overflow-hidden flex flex-col justify-between min-h-[16rem] group shadow-xl"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[60px] -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-indigo-500/20 transition-colors"></div>

              <div className="flex items-start justify-between">
                <div className="p-3 bg-indigo-500/20 rounded-2xl ring-1 ring-white/10 group-hover:ring-indigo-500/40 transition-all">
                  <Wallet className="w-6 h-6 text-indigo-400" />
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border ${
                    account.status === "active"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-slate-500/10 text-slate-400 border-white/5"
                  }`}
                >
                  {account.status}
                </span>
              </div>

              <div>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
                  Verified Balance
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-white">
                    {account.balance.toLocaleString()}
                  </span>
                  <span className="text-slate-500 font-bold text-xs uppercase">
                    {account.currency}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 mt-6 border-t border-white/5 pt-5">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-black uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Secured Vault</span>
                </div>
                <button
                  onClick={() => navigate(`/accounts/${account._id}`)}
                  className="flex items-center gap-1.5 text-indigo-400 hover:text-white transition-colors text-xs font-black uppercase tracking-widest group/btn"
                >
                  Inspect
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          ))}

          {accounts.length === 0 && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-24 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-center group cursor-pointer hover:border-indigo-500/30 hover:bg-indigo-500/[0.02] transition-all"
              onClick={createAccount}
            >
              <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ring-1 ring-white/10">
                <TrendingUp className="w-10 h-10 text-slate-600 group-hover:text-indigo-500 transition-colors" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">
                No active accounts
              </h3>
              <p className="text-slate-400 max-w-xs px-4 text-sm font-medium">
                Establish your first ledger entry to begin professional asset
                management.
              </p>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
