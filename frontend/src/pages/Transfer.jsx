import React, { useState, useEffect, useCallback } from "react";
import api from "../utils/api";
import {
  Send,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Wallet,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";

// Move fetchAccounts and handleTransfer outside the component for react-refresh compliance
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
        "Transaction failed. Please verify recipient ID and balance.",
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
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: '' }

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
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
          Initializing Secure Channel...
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10"
    >
      <header className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center ring-1 ring-white/10">
            <Send className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Express Transfer
            </h1>
            <p className="text-slate-400 font-medium">
              Transmit funds across the digital ledger instantly.
            </p>
          </div>
        </div>

        <AnimatePresence>
          {status && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className={`p-4 rounded-2xl flex items-center gap-3 overflow-hidden ${
                status.type === "success"
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                  : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
              }`}
            >
              {status.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="text-sm font-bold">{status.message}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <form onSubmit={handleTransfer} className="space-y-8">
        <div className="space-y-4">
          <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">
            Source Account
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {accounts.map((acc) => (
              <motion.div
                key={acc._id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() =>
                  setFormData({ ...formData, fromAccount: acc._id })
                }
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex flex-col justify-between gap-4 group ${
                  formData.fromAccount === acc._id
                    ? "border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10"
                    : "border-white/5 hover:border-white/10 bg-white/5 opacity-80"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`p-2 rounded-lg ${formData.fromAccount === acc._id ? "bg-indigo-500 text-white" : "bg-white/5 text-slate-500"}`}
                  >
                    <Wallet className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black text-slate-500 tracking-widest uppercase">
                    ****{acc._id.slice(-4)}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Available
                  </p>
                  <p className="text-xl font-black text-white">
                    {acc.balance.toLocaleString()}{" "}
                    <span className="text-[10px] text-slate-500">
                      {acc.currency}
                    </span>
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">
              Recipient Ledger ID
            </label>
            <div className="relative group">
              <input
                type="text"
                required
                placeholder="Ex: 60d5ec..."
                className="w-full h-14 pl-5 pr-14 bg-white/[0.03] border-white/5 focus:border-indigo-500/50 focus:bg-white/[0.05] rounded-2xl transition-all duration-300 text-sm font-medium outline-none text-white ring-offset-0 focus:ring-4 focus:ring-indigo-500/10"
                value={formData.toAccount}
                onChange={(e) =>
                  setFormData({ ...formData, toAccount: e.target.value })
                }
              />
              <ArrowRight className="absolute right-5 top-4.5 w-5 h-5 text-slate-600 group-focus-within:text-indigo-400" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">
              Amount to Transmit
            </label>
            <div className="relative group">
              <input
                type="number"
                required
                min="1"
                placeholder="0.00"
                className="w-full h-20 text-4xl font-black text-center bg-white/[0.03] border-white/5 focus:border-indigo-500/50 focus:bg-white/[0.05] rounded-2xl transition-all duration-300 outline-none text-white ring-offset-0 focus:ring-4 focus:ring-indigo-500/10"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 font-black tracking-widest text-xs pointer-events-none">
                INR
              </div>
            </div>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading || accounts.length === 0}
          className="w-full btn-primary h-16 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-2xl flex items-center justify-center gap-3 text-lg font-black shadow-2xl shadow-indigo-500/20 border-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <Send className="w-5 h-5 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
              <span>Confirm & Execute Transfer</span>
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default Transfer;
