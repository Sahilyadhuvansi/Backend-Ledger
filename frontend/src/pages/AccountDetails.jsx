import { motion } from "framer-motion";
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
      <div className="flex flex-col items-center justify-center py-32 gap-6">
        <div className="w-14 h-14 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-slate-600 font-bold uppercase tracking-wider text-sm">
          Fetching Ledger Secrets...
        </p>
      </div>
    );

  if (error)
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center text-center gap-6 py-20 px-4"
      >
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center border-4 border-white shadow-xl">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900">
          Access Denied
        </h2>
        <p className="text-slate-500 max-w-sm text-lg">{error}</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="btn-primary w-auto px-8 mt-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Go back safely
        </button>
      </motion.div>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12 max-w-4xl mx-auto"
    >
      <div className="flex items-center justify-between pb-6 border-b border-slate-100">
        <motion.button
          whileHover={{ x: -4 }}
          onClick={() => navigate("/dashboard")}
          className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center group transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5 text-slate-500 group-hover:text-slate-900 transition-colors" />
        </motion.button>
        <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 shadow-sm">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
            Verified Ledger Record
          </span>
        </div>
      </div>

      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-3xl p-8 sm:p-12 flex flex-col sm:flex-row sm:items-center justify-between gap-8 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 flex-shrink-0">
            <Wallet className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 leading-tight mb-2">
              Primary Vault
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider bg-white text-indigo-700 px-3 py-1.5 rounded-lg border border-indigo-200">
                Ledger ID: {account._id.slice(-8).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
        <div className="sm:text-right bg-white p-6 rounded-2xl border border-indigo-100 shadow-xl shadow-indigo-100/50 flex flex-col justify-center min-w-[200px]">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
            Available Funds
          </p>
          <p className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            {(account.calculatedBalance ?? account.balance).toLocaleString()}
            <span className="text-lg text-indigo-600 font-bold ml-2">
              {account.currency}
            </span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-8 bg-white border border-slate-200 rounded-3xl flex items-center gap-6 shadow-sm hover:shadow-md transition-shadow cursor-default group">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center group-hover:rotate-6 transition-transform border border-emerald-100">
            <TrendingUp className="w-8 h-8 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 mb-1">
              Incoming Velocity
            </p>
            <p className="text-2xl font-black text-slate-900">
              Optimal{" "}
              <span className="text-sm text-emerald-600 ml-2 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                14% Increase
              </span>
            </p>
          </div>
        </div>

        <div className="p-8 bg-white border border-slate-200 rounded-3xl flex items-center gap-6 shadow-sm hover:shadow-md transition-shadow cursor-default group">
          <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center group-hover:-rotate-6 transition-transform border border-rose-100">
            <TrendingDown className="w-8 h-8 text-rose-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 mb-1">
              Outflow Efficiency
            </p>
            <p className="text-2xl font-black text-slate-900">
              Stable{" "}
              <span className="text-sm text-indigo-500 ml-2 font-bold bg-indigo-50 px-2 py-0.5 rounded-md">
                Secure
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6 pt-10 border-t border-slate-200">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <History className="w-6 h-6 text-slate-700" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">
              Transaction History
            </h3>
          </div>
          <button className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50 px-4 py-2 rounded-xl">
            Export CSV
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>

        <div className="min-h-[250px] flex flex-col items-center justify-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center mb-4">
            <History className="w-8 h-8 text-slate-400" />
          </div>
          <h4 className="text-lg font-bold text-slate-700 mb-1">
            No Recent Activity
          </h4>
          <p className="text-sm text-slate-500 font-medium">
            When you complete transfers, they will appear chronologically here.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default AccountDetails;
