import { motion, AnimatePresence } from "framer-motion";
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
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Accounts Overview
          </h1>
          <p className="text-slate-500 font-medium">
            Manage your digital assets and track transaction flows securely.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={createAccount}
          className="btn-primary w-auto sm:w-auto px-6"
        >
          <Plus className="w-5 h-5" />
          <span>New Account</span>
        </motion.button>
      </header>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-100 font-medium mb-6"
          >
            <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {loading && accounts.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-56 rounded-2xl bg-slate-50 border border-slate-100 animate-pulse"
            ></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {accounts.map((account, index) => (
            <motion.div
              key={account._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4, scale: 1.01 }}
              className="p-8 rounded-3xl border border-slate-200 bg-white hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100 transition-all flex flex-col justify-between min-h-[16rem] group"
            >
              <div className="flex items-start justify-between">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl ring-1 ring-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Wallet className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(account._id);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 bg-white text-slate-500 hover:text-indigo-600 border border-slate-200 hover:border-indigo-300 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all z-10"
                    title="Copy Ledger ID"
                  >
                    <span>ID: {account._id.substring(0, 8)}...</span>
                  </button>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                      account.status === "active"
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                        : "bg-slate-50 text-slate-500 border-slate-200"
                    }`}
                  >
                    {account.status}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-slate-500 text-sm font-semibold mb-2">
                  Verified Balance
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    {account.balance.toLocaleString()}
                  </span>
                  <span className="text-slate-500 font-bold text-sm uppercase">
                    {account.currency}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6 border-t border-slate-100 pt-5">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold uppercase tracking-wide">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Secured Vault</span>
                </div>
                <button
                  onClick={() => navigate(`/accounts/${account._id}`)}
                  className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition-colors text-sm font-bold uppercase tracking-wide group/btn"
                >
                  Inspect
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          ))}

          {accounts.length === 0 && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-20 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-center group cursor-pointer hover:border-indigo-400 hover:bg-slate-50 transition-all"
              onClick={createAccount}
            >
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-8 h-8 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                No active accounts
              </h3>
              <p className="text-slate-500 max-w-sm px-4 text-sm">
                Click this section to establish your first ledger and begin
                managing your digital assets professionally.
              </p>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
