import { motion } from "framer-motion";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../core/utils/api";
import { useSocket } from "../../core/context/SocketContext";
import {
  ArrowLeft,
  Wallet,
  ShieldCheck,
  History,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Check,
  Copy,
} from "lucide-react";
import toast from "react-hot-toast";

const AccountDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lastUpdate } = useSocket();

  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  /* ================= FETCH ================= */

  const fetchDetails = useCallback(async () => {
    try {
      setLoading(true);

      const { data } = await api.get(`/accounts/${id}`);

      setAccount(data?.data || null);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails, lastUpdate]);

  /* ================= BALANCE ================= */

  const balance = useMemo(() => {
    return account ? (account.calculatedBalance ?? account.balance ?? 0) : 0;
  }, [account]);

  /* ================= COPY ================= */

  const copyId = async () => {
    try {
      const idStr = account?._id ? String(account._id) : "";
      if (!idStr) return;
      
      await navigator.clipboard.writeText(idStr);
      setCopied(true);
      toast.success("Ledger ID copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.warn("Clipboard failed");
    }
  };

  /* ================= HELPERS ================= */

  const formatCurrency = (value) => Number(value || 0).toLocaleString("en-IN");

  const formatDate = (date) => new Date(date).toLocaleString("en-IN");

  /* ================= LOADING ================= */

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-6">
        <div className="w-14 h-14 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-slate-600 font-bold uppercase tracking-wider text-sm">
          Fetching Ledger Secrets...
        </p>
      </div>
    );

  /* ================= ERROR ================= */

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

  /* ================= MAIN ================= */

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12 max-w-4xl mx-auto"
    >
      {/* HEADER */}

      <div className="flex items-center justify-between pb-6 border-b border-slate-100">
        <motion.button
          whileHover={{ x: -4 }}
          onClick={() => navigate("/dashboard")}
          className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-sm"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </motion.button>

        <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 shadow-sm">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
            Verified Ledger Record
          </span>
        </div>
      </div>

      {/* ACCOUNT CARD */}

      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-3xl p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <Wallet className="w-10 h-10 text-white" />
          </div>

          <div>
            <h2 className="text-3xl font-black text-slate-900">
              Primary Vault
            </h2>

            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={copyId}
                className={`text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg border transition-all flex items-center gap-2 ${
                  copied
                    ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                    : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-indigo-200"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy ID
                  </>
                )}
              </button>

              <span className="text-sm font-bold text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-indigo-100">
                {account?._id}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-xl">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
            Available Funds
          </p>

          <p className="text-5xl font-extrabold text-slate-900">
            {formatCurrency(balance)}
            <span className="text-lg text-indigo-600 font-bold ml-2">
              {account.currency}
            </span>
          </p>
        </div>
      </div>

      {/* TRANSACTIONS */}

      <div className="space-y-6 pt-10 border-t border-slate-200">
        <div className="flex items-center gap-3">
          <History className="w-6 h-6 text-slate-700" />
          <h3 className="text-2xl font-bold text-slate-900">
            Transaction History
          </h3>
        </div>

        {account?.recentTransactions?.length > 0 ? (
          <div className="space-y-4">
            {account.recentTransactions.map((tx) => {
              const isCredit = tx.type === "credit";

              return (
                <div
                  key={tx.transaction?._id || tx._id}
                  className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex justify-between items-center"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                        isCredit
                          ? "bg-emerald-50 border-emerald-100"
                          : "bg-rose-50 border-rose-100"
                      }`}
                    >
                      {isCredit ? (
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
                        {formatDate(tx.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={`text-lg font-black ${
                        isCredit ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {isCredit ? "+" : "-"}
                      {formatCurrency(tx.amount)} {account.currency}
                    </p>

                    <p className="text-[10px] text-slate-400">
                      TxID:{" "}
                      {tx.transaction?._id
                        ? String(tx.transaction._id).slice(0, 8)
                        : "N/A"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="min-h-[250px] flex flex-col items-center justify-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <History className="w-8 h-8 text-slate-400 mb-4" />
            <h4 className="text-lg font-bold text-slate-700">
              No Recent Activity
            </h4>
            <p className="text-sm text-slate-500 text-center max-w-sm px-4">
              When you complete transfers, they will appear here.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AccountDetails;
