import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import {
  ArrowLeft,
  Wallet,
  ShieldCheck,
  History,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
// import { motion } from "framer-motion";

const AccountDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDetails = useCallback(async () => {
    try {
      const { data } = await api.get(`/accounts/${id}`);
      setAccount(data.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
          Decrypting Ledger Data...
        </p>
      </div>
    );

  if (error)
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center text-center gap-6 py-10"
      >
        <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center ring-1 ring-rose-500/20">
          <AlertTriangle className="w-10 h-10 text-rose-500" />
        </div>
        <h2 className="text-3xl font-black text-white">Access Violation</h2>
        <p className="text-slate-400 max-w-sm">{error}</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="btn-primary px-8"
        >
          Return to Hub
        </button>
      </motion.div>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10"
    >
      <div className="flex items-center justify-between">
        <motion.button
          whileHover={{ x: -4 }}
          onClick={() => navigate("/dashboard")}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center group transition-all ring-1 ring-white/10 border border-white/5"
        >
          <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
        </motion.button>
        <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/5">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Immutable Ledger Record
          </span>
        </div>
      </div>

      <div className="relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div className="flex items-center gap-6">
            <motion.div
              whileHover={{ rotate: 5 }}
              className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/30"
            >
              <Wallet className="w-10 h-10 text-white" />
            </motion.div>
            <div>
              <h2 className="text-3xl font-black text-white leading-none mb-3">
                Standard Savings
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-widest bg-white/10 text-indigo-400 px-3 py-1 rounded-lg border border-indigo-500/20">
                  ID: {account._id.slice(-12).toUpperCase()}
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">
              Current Net Worth
            </p>
            <p className="text-5xl font-black text-white tracking-tighter">
              {(account.calculatedBalance ?? account.balance).toLocaleString()}
              <span className="text-sm text-slate-500 ml-2 font-black uppercase">
                {account.currency}
              </span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center gap-5 group hover:bg-white/[0.04] transition-all">
            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ring-1 ring-emerald-500/20">
              <TrendingUp className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                Account Velocity
              </p>
              <p className="text-xl font-black text-emerald-400">
                +14.2%{" "}
                <span className="text-[10px] text-slate-600 ml-1">CYCLE</span>
              </p>
            </div>
          </div>
          <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center gap-5 group hover:bg-white/[0.04] transition-all">
            <div className="w-14 h-14 bg-rose-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ring-1 ring-rose-500/20">
              <TrendingDown className="w-7 h-7 text-rose-400" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                Spend Efficiency
              </p>
              <p className="text-xl font-black text-rose-400">
                Optimized{" "}
                <span className="text-[10px] text-slate-600 ml-1">STABLE</span>
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6 pt-6 border-t border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <History className="w-5 h-5 text-indigo-400" />
              <h3 className="text-xl font-black text-white uppercase tracking-tight">
                Ledger Audit Trail
              </h3>
            </div>
            <button className="flex items-center gap-2 text-[10px] font-black text-indigo-400 hover:text-white uppercase tracking-widest transition-all">
              Detailed Analytics
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="min-h-[200px] flex flex-col items-center justify-center py-12 bg-white/[0.01] rounded-3xl border border-dashed border-white/5">
            <History className="w-12 h-12 text-slate-800 mb-4" />
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-700">
              No recent entries found in the vault
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AccountDetails;
