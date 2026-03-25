import React, { useState, useEffect } from "react";
import {
  Send,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Wallet,
  Users,
} from "lucide-react";
import { fetchAccounts, handleTransfer } from "./services/transferService";
import { useAuth } from "../../core/context/AuthContext";

const Transfer = () => {
  const { user } = useAuth();
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
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
        <p className="text-slate-400 font-bold tracking-widest text-[10px] uppercase">
          Initializing Profiles...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-12 py-6">
      <header className="flex flex-col gap-4 pb-8 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-800 border border-slate-200">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Transfer Assets
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Securely transmit funds across digital ledger identification strings.
            </p>
          </div>
        </div>

        {status && (
          <div
            className={`p-4 rounded-lg flex items-center gap-3 font-medium mt-4 border ${
              status.type === "success"
                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                : "bg-rose-50 text-rose-700 border-rose-100"
            }`}
          >
            {status.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            )}
            <span className="text-xs font-bold leading-none">{status.message}</span>
          </div>
        )}
      </header>

      <form onSubmit={onTransfer} className="space-y-12">
        <div className="space-y-5">
          <div className="flex items-center justify-between px-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Originating Ledger
            </label>
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              Select one profile
            </span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {accounts.map((acc) => (
              <div
                key={acc._id}
                onClick={() =>
                  setFormData({ ...formData, fromAccount: acc._id })
                }
                className={`p-5 rounded-xl border-2 cursor-pointer transition-all flex flex-col gap-4 ${
                  formData.fromAccount === acc._id
                    ? "border-slate-900 bg-white shadow-lg shadow-slate-200"
                    : "border-slate-100 bg-slate-50 hover:border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`p-1.5 rounded-lg border ${
                      formData.fromAccount === acc._id 
                        ? "bg-slate-900 text-white border-slate-900" 
                        : "bg-white text-slate-400 border-slate-200"
                    }`}
                  >
                    <Wallet className="w-3.5 h-3.5" />
                  </div>
                  <span className={`text-[10px] font-mono font-bold uppercase ${
                    formData.fromAccount === acc._id ? "text-slate-900" : "text-slate-400"
                  }`}>
                    UID: {acc._id.slice(-6)}
                  </span>
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900">
                    ₹{acc.balance.toLocaleString()}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                    Available Balance ({acc.currency})
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8 p-8 rounded-2xl bg-slate-50 border border-slate-200/60">
          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Destination Target
              </label>
              {user?.username && (
                <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 uppercase tracking-wider">
                  Your ID: @{user.username}
                </span>
              )}
            </div>
            <div className="relative group">
              <input
                type="text"
                required
                placeholder="Ex: @janesmith or 123456..."
                className="input-field !pl-11 h-12 bg-white"
                value={formData.toAccount}
                onChange={(e) =>
                  setFormData({ ...formData, toAccount: e.target.value })
                }
              />
              <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-600 transition-colors" />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">
              Transfer Amount (INR)
            </label>
            <div className="relative group">
              <input
                type="number"
                required
                min="1"
                placeholder="0.00"
                className="w-full h-16 px-6 rounded-xl border border-slate-200 bg-white text-3xl font-bold text-slate-900 placeholder-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all text-center"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
              />
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center pt-1">
              All transactions are final once executed.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || accounts.length === 0}
          className="btn-primary h-14 text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-slate-200"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <ArrowRight className="w-4 h-4" />
              <span>Confirm & Authorize Transaction</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default Transfer;

