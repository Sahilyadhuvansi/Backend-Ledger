import { motion } from "framer-motion";
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useSocket } from "../context/SocketContext";
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
  const { lastUpdate } = useSocket();

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
  }, [fetchDetails, lastUpdate]);

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

      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-8 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 min-w-0 flex-1">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 flex-shrink-0">
            <Wallet className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight mb-2 truncate">
              Primary Vault
            </h2>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3">
              <button
                onClick={(e) => {
                  navigator.clipboard.writeText(account._id);
                  e.currentTarget.innerHTML = "Copied!";
                  setTimeout(
                    () => (e.currentTarget.innerHTML = "Copy ID"),
                    2000,
                  );
                }}
                className="text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-3 sm:px-4 py-2 rounded-lg border border-indigo-200 transition-colors shadow-sm whitespace-nowrap"
              >
                Copy ID
              </button>
              <span className="text-xs sm:text-sm font-bold text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-indigo-100 shadow-sm truncate max-w-[150px] sm:max-w-[250px] md:max-w-[300px]">
                {account._id}
              </span>
            </div>
          </div>
        </div>
        <div className="text-left sm:text-right bg-white p-6 rounded-2xl border border-indigo-100 shadow-xl shadow-indigo-100/50 flex flex-col justify-center shrink-0 w-full md:w-auto">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
            Available Funds
          </p>
          <p className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight whitespace-nowrap">
            {(account.calculatedBalance ?? account.balance).toLocaleString()}
            <span className="text-lg text-indigo-600 font-bold ml-2 inline-block">
              {account.currency}
            </span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 sm:p-8 bg-white border border-slate-200 rounded-3xl flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 shadow-sm hover:shadow-md transition-shadow cursor-default group">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-emerald-50 rounded-2xl flex items-center justify-center group-hover:rotate-6 transition-transform border border-emerald-100 flex-shrink-0">
            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-bold text-slate-500 mb-1">
              Incoming Velocity
            </p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 flex items-center flex-wrap gap-2">
              Optimal
              <span className="text-[10px] sm:text-sm text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                14% Increase
              </span>
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-8 bg-white border border-slate-200 rounded-3xl flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 shadow-sm hover:shadow-md transition-shadow cursor-default group">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-rose-50 rounded-2xl flex items-center justify-center group-hover:-rotate-6 transition-transform border border-rose-100 flex-shrink-0">
            <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8 text-rose-600" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-bold text-slate-500 mb-1">
              Outflow Efficiency
            </p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 flex items-center flex-wrap gap-2">
              Stable
              <span className="text-[10px] sm:text-sm text-indigo-500 font-bold bg-indigo-50 px-2 py-0.5 rounded-md">
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
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
              Transaction History
            </h3>
          </div>
        </div>

        {account.recentTransactions && account.recentTransactions.length > 0 ? (
          <div className="space-y-4">
            {account.recentTransactions.map((tx, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center border ${tx.type === "credit" ? "bg-emerald-50 border-emerald-100" : "bg-rose-50 border-rose-100"}`}
                  >
                    {tx.type === "credit" ? (
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-rose-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 capitalize">
                      {tx.type} Transfer
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(tx.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p
                    className={`text-lg font-black ${tx.type === "credit" ? "text-emerald-600" : "text-rose-600"}`}
                  >
                    {tx.type === "credit" ? "+" : "-"}
                    {tx.amount} {account.currency}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    TxID: {tx.transaction?._id?.substring(0, 8) || "N/A"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="min-h-[250px] flex flex-col items-center justify-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center mb-4">
              <History className="w-8 h-8 text-slate-400" />
            </div>
            <h4 className="text-lg font-bold text-slate-700 mb-1">
              No Recent Activity
            </h4>
            <p className="text-sm text-slate-500 font-medium text-center max-w-sm px-4">
              When you complete transfers, they will appear chronologically
              here.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AccountDetails;
