import React, { useState, useEffect } from "react";
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
} from "lucide-react";

const AccountDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      const { data } = await api.get(`/accounts/${id}`);
      setAccount(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
          Retrieving Vault Data...
        </p>
      </div>
    );

  if (error)
    return (
      <div className="max-w-xl mx-auto py-20 px-6 glass-panel flex flex-col items-center text-center gap-6 border-rose-500/20">
        <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-10 h-10 text-rose-500" />
        </div>
        <h2 className="text-2xl font-bold text-white">Access Denied</h2>
        <p className="text-slate-400">{error}</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="btn-primary px-8"
        >
          Return to Safety
        </button>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-10 animate-fade-in pb-20">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/dashboard")}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center group transition-all ring-1 ring-white/10"
        >
          <ArrowLeft className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors group-hover:-translate-x-1" />
        </button>
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            End-to-End Encrypted
          </span>
        </div>
      </div>

      <div className="glass-panel p-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-emerald-500/10 transition-all duration-700"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none group-hover:bg-indigo-500/10 transition-all duration-700"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-indigo-500 rounded-3xl flex items-center justify-center shadow-xl shadow-indigo-500/20 group-hover:rotate-6 transition-transform">
              <Wallet className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white leading-tight">
                Elite Standard
                <br />
                Savings Account
              </h2>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-white/10 text-slate-400 px-3 py-1 rounded-full border border-white/5">
                  Vault ID: {account._id.toUpperCase()}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">
                  Live
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">
              Available Funds
            </p>
            <p className="text-5xl font-black text-white">
              {account.calculatedBalance.toLocaleString()}{" "}
              <span className="text-xs text-slate-500 align-top mt-2 ml-1">
                {account.currency}
              </span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl flex items-center gap-5 group/stat hover:bg-emerald-500/10 transition-colors">
            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center group-hover/stat:scale-110 transition-transform">
              <TrendingUp className="w-7 h-7 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                Account Growth
              </p>
              <p className="text-xl font-black text-emerald-400">
                +12.4%{" "}
                <span className="text-[10px] text-slate-600 font-bold ml-1">
                  THIS MONTH
                </span>
              </p>
            </div>
          </div>
          <div className="p-6 bg-rose-500/5 border border-rose-500/10 rounded-3xl flex items-center gap-5 group/stat hover:bg-rose-500/10 transition-colors">
            <div className="w-14 h-14 bg-rose-500/10 rounded-2xl flex items-center justify-center group-hover/stat:scale-110 transition-transform">
              <TrendingDown className="w-7 h-7 text-rose-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                Total Spending
              </p>
              <p className="text-xl font-black text-rose-400">
                Low{" "}
                <span className="text-[10px] text-slate-600 font-bold ml-1">
                  OPTIMIZED
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <History className="w-6 h-6 text-indigo-400" />
              <h3 className="text-xl font-black text-white uppercase tracking-tight">
                Recent Activity
              </h3>
            </div>
            <button className="text-xs font-black text-indigo-400 hover:text-white uppercase tracking-widest border-b border-indigo-400/20 hover:border-white transition-all">
              View Analytics
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col items-center justify-center py-10 opacity-40">
              <History className="w-12 h-12 text-slate-600 mb-4" />
              <p className="text-sm font-bold uppercase tracking-widest text-slate-600">
                No activity logged in the Ledger
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountDetails;
