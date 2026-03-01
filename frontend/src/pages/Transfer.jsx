import React, { useState, useEffect } from "react";
import api from "../utils/api";
import {
  Send,
  ArrowRight,
  Shield,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

const Transfer = () => {
  const [formData, setFormData] = useState({
    fromAccount: "",
    toAccount: "",
    amount: "",
  });
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: '' }

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const { data } = await api.get("/accounts");
      setAccounts(data.data);
      if (data.data.length > 0) {
        setFormData((prev) => ({ ...prev, fromAccount: data.data[0]._id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const idempotencyKey = crypto.randomUUID();
      await api.post("/transactions", { ...formData, idempotencyKey });
      setStatus({
        type: "success",
        message: "Funds transferred successfully!",
      });
      setFormData({ ...formData, toAccount: "", amount: "" });
      fetchAccounts();
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 pb-20 px-4 animate-fade-in">
      <div className="flex flex-col items-center mb-10">
        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 ring-1 ring-white/10 shadow-inner group">
          <Send className="w-8 h-8 text-indigo-500 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Express Transfer
        </h1>
        <p className="text-slate-400 mt-2 font-medium">
          Safe, secure, and instant peer-to-peer transfers.
        </p>
      </div>

      <div className="glass-panel p-10 space-y-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-indigo-500/10 transition-all duration-700"></div>

        {status && (
          <div
            className={`p-5 rounded-2xl flex items-center gap-4 animate-fade-in ${
              status.type === "success"
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
            }`}
          >
            {status.type === "success" ? (
              <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
            )}
            <span className="font-bold">{status.message}</span>
          </div>
        )}

        <form onSubmit={handleTransfer} className="space-y-8">
          <div>
            <label className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4 block">
              Select Source Account
            </label>
            <div className="grid grid-cols-1 gap-3">
              {accounts.map((acc) => (
                <div
                  key={acc._id}
                  onClick={() =>
                    setFormData({ ...formData, fromAccount: acc._id })
                  }
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex items-center justify-between group/card ${
                    formData.fromAccount === acc._id
                      ? "border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10"
                      : "border-white/5 hover:border-white/10 bg-white/5 opacity-80"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${formData.fromAccount === acc._id ? "bg-indigo-500 text-white" : "bg-white/5 text-slate-500"}`}
                    >
                      <Shield className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white uppercase text-xs tracking-widest mb-1">
                        Standard Savings
                      </h4>
                      <p className="text-slate-400 text-xs font-medium">
                        **** {acc._id.slice(-6).toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-white">
                      {acc.balance.toLocaleString()}{" "}
                      <span className="text-[10px] text-slate-500 font-bold">
                        {acc.currency}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="h-px bg-white/5 my-8"></div>

          <div>
            <label className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4 block">
              Recipient Details
            </label>
            <div className="relative group">
              <input
                type="text"
                required
                placeholder="Paste destination account ID here"
                className="w-full h-14 pl-5 pr-14 bg-white/5 focus:bg-white/10 focus:ring-2 focus:ring-indigo-500/20 border-white/5 transition-all text-sm font-bold tracking-wider"
                value={formData.toAccount}
                onChange={(e) =>
                  setFormData({ ...formData, toAccount: e.target.value })
                }
              />
              <ArrowRight className="absolute right-5 top-4.5 w-5 h-5 text-slate-600 group-focus-within:text-indigo-400" />
            </div>
          </div>

          <div>
            <label className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4 block">
              Amount to Send
            </label>
            <div className="relative group">
              <input
                type="number"
                required
                min="1"
                placeholder="0.00"
                className="w-full h-18 text-3xl font-black pl-5 focus:ring-2 focus:ring-indigo-500/20 bg-white/5 border-white/5 text-center focus:scale-[1.02] transition-all"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
              />
              <div className="flex justify-center mt-2 text-xs font-bold text-slate-600 uppercase tracking-widest">
                Digital Ledger Currency (INR)
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || accounts.length === 0}
            className="w-full btn-primary h-14 flex items-center justify-center gap-3 text-lg shadow-indigo-500/20 mt-4 group"
          >
            {loading ? (
              <div className="loading-spinner"></div>
            ) : (
              <Send className="w-6 h-6 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
            )}
            {loading ? "Processing Transaction..." : "Confirm and Send Funds"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Transfer;
