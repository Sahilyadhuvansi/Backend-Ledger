import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect, useCallback } from "react";
import api from "../utils/api";
import {
  Send,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Wallet,
  Users,
} from "lucide-react";

export const fetchAccounts = async (
  setAccounts,
  setFormData,
  setStatus,
  setFetching,
) => {
  try {
    const { data } = await api.get("/accounts");
    setAccounts(data.data);
    if (data.data.length > 0) {
      setFormData((prev) =>
        prev.fromAccount ? prev : { ...prev, fromAccount: data.data[0]._id },
      );
    }
  } catch (err) {
    console.error(err);
    setStatus({ type: "error", message: "Failed to fetch accounts." });
  } finally {
    setFetching(false);
  }
};

export const handleTransfer = async (
  e,
  loading,
  setLoading,
  setStatus,
  formData,
  setFormData,
  fetchAccounts,
) => {
  e.preventDefault();
  if (loading) return;
  setLoading(true);
  setStatus(null);
  try {
    const idempotencyKey = crypto.randomUUID();
    await api.post("/transactions", { ...formData, idempotencyKey });
    setStatus({
      type: "success",
      message: "Funds transferred successfully! Your ledger has been updated.",
    });
    setFormData((prev) => ({ ...prev, toAccount: "", amount: "" }));
    fetchAccounts();
    setTimeout(() => setStatus(null), 5000);
  } catch (err) {
    setStatus({
      type: "error",
      message:
        err.response?.data?.message ||
        "Transaction failed. Please verify recipient ID.",
    });
  } finally {
    setLoading(false);
  }
};

const Transfer = () => {
  const [formData, setFormData] = useState({
    fromAccount: "",
    toAccount: "",
    amount: "",
  });
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    fetchAccounts(setAccounts, setFormData, setStatus, setFetching);
  }, []);

  const onTransfer = (e) =>
    handleTransfer(
      e,
      loading,
      setLoading,
      setStatus,
      formData,
      setFormData,
      () => fetchAccounts(setAccounts, setFormData, setStatus, setFetching),
    );

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold tracking-wide text-sm">
          Loading Wallet Profiles...
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10"
    >
      <header className="flex flex-col gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
            <Send className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">
              Transmit Funds
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Securely send money across external and internal ledger IDs.
            </p>
          </div>
        </div>

        <AnimatePresence>
          {status && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className={`p-4 rounded-xl flex items-center gap-3 overflow-hidden font-medium mt-4 ${
                status.type === "success"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-red-50 text-red-600 border border-red-200"
              }`}
            >
              {status.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="text-sm">{status.message}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <form onSubmit={onTransfer} className="space-y-10 max-w-3xl">
        <div className="space-y-4">
          <label className="text-sm font-bold text-slate-800 ml-1">
            Source Account
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((acc) => (
              <motion.div
                key={acc._id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() =>
                  setFormData({ ...formData, fromAccount: acc._id })
                }
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-4 ${
                  formData.fromAccount === acc._id
                    ? "border-indigo-600 bg-indigo-50 shadow-md shadow-indigo-100"
                    : "border-slate-200 hover:border-indigo-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`p-2 rounded-xl flex-shrink-0 ${formData.fromAccount === acc._id ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`}
                  >
                    <Wallet className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate ml-2">
                    ID: {acc._id.slice(-4)}
                  </span>
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900 truncate">
                    {acc.balance.toLocaleString()}
                  </p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                    Available {acc.currency}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="space-y-6 bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-100">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-800 ml-1">
              Recipient Ledger ID
            </label>
            <div className="relative group">
              <input
                type="text"
                required
                placeholder="Ex: 60d5ec..."
                className="input-field !pl-12 h-14 bg-white"
                value={formData.toAccount}
                onChange={(e) =>
                  setFormData({ ...formData, toAccount: e.target.value })
                }
              />
              <Users className="absolute left-4 top-4 w-6 h-6 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            </div>
            <p className="text-xs text-slate-500 ml-2 mt-1">
              Double check the Ledger ID before transmitting.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-800 ml-1">
              Amount to Transmit
            </label>
            <div className="relative group">
              <input
                type="number"
                required
                min="1"
                placeholder="0.00"
                className="input-field h-20 text-3xl font-extrabold text-slate-900 bg-white text-center"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg pointer-events-none">
                INR
              </div>
            </div>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading || accounts.length === 0}
          className="btn-primary h-16 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <ArrowRight className="w-6 h-6" />
              <span>Confirm & Execute Transfer</span>
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default Transfer;
