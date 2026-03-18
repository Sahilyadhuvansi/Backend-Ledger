import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../core/utils/api";
import { useSocket } from "../../core/context/SocketContext";
import { useAuth } from "../../core/context/AuthContext";
import {
  Plus,
  Send,
  AlertCircle,
  RefreshCw,
  LayoutDashboard,
  Settings,
  ShieldCheck,
} from "lucide-react";

import AccountCard from "./components/AccountCard";
import BalanceCard from "./components/BalanceCard";
import TransactionTable from "./components/TransactionTable";
import InvestmentCard from "./components/InvestmentCard";

const Dashboard = () => {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const { lastUpdate } = useSocket();
  const { user } = useAuth();

  /* ================= FETCH DATA ================= */

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const [accountsRes, transactionsRes] = await Promise.all([
        api.get("/accounts"),
        api.get("/transactions/history?limit=5"),
      ]);

      setAccounts(accountsRes?.data?.data || []);
      setTransactions(transactionsRes?.data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  /* ================= INITIAL LOAD ================= */

  useEffect(() => {
    fetchData();
  }, [fetchData, lastUpdate]);

  /* ================= HASH SCROLL ================= */

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const id = location.hash.replace("#", "");

    requestAnimationFrame(() => {
      const element = document.getElementById(id);
      if (element) {
        const offset = 100; // Account for fixed header
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    });
  }, [location.hash]);

  /* ================= ERROR AUTO CLEAR ================= */

  useEffect(() => {
    if (!error) return;

    const timer = setTimeout(() => {
      setError("");
    }, 4000);

    return () => clearTimeout(timer);
  }, [error]);

  /* ================= ACCOUNT ================= */

  const mainAccount = accounts?.[0] ?? null;

  const ledgerBalance = useMemo(() => {
    if (!mainAccount) return 0;
    const balance = Number(mainAccount.balance) || 0;
    const pendingCredits = Number(mainAccount.pendingCredits) || 0;
    const pendingDebits = Number(mainAccount.pendingDebits) || 0;
    return balance + pendingCredits - pendingDebits;
  }, [mainAccount]);

  /* ================= CREATE ACCOUNT ================= */

  const createAccount = async () => {
    try {
      setRefreshing(true);
      await api.post("/accounts", { currency: "INR" });
      await fetchData(true);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
      setRefreshing(false);
    }
  };

  /* ================= LOADING STATE ================= */

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse p-6">
        <div className="flex justify-between items-center mb-12">
          <div className="space-y-3">
             <div className="h-4 w-32 bg-slate-100 rounded" />
             <div className="h-10 w-64 bg-slate-200 rounded" />
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-10 bg-slate-100 rounded-lg" />
            <div className="h-10 w-32 bg-slate-100 rounded-lg" />
          </div>
        </div>
        <div className="h-56 w-full bg-slate-100 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-40 bg-slate-100 rounded-2xl" />
          <div className="h-40 bg-slate-100 rounded-2xl" />
        </div>
        <div className="h-[400px] w-full bg-slate-100 rounded-2xl" />
      </div>
    );
  }

  /* ================= DASHBOARD ================= */

  return (
    <div className="max-w-[1400px] mx-auto space-y-12 py-8 px-6">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
              Terminal Overview
            </span>
          </div>

          <h1 className="text-3xl font-bold text-slate-900 tracking-tight leading-none mb-2">
            Asset Intelligence
          </h1>

          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
            Identity: {(user?.name || "System User")} [Status: <span className="text-emerald-500">Authenticated</span>]
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchData(true)}
            className={`p-2.5 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm ${
              refreshing ? "animate-spin text-slate-900" : ""
            }`}
            title="Refresh Audit Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => navigate("/transfer")}
            className="flex items-center gap-2.5 px-6 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-widest shadow-md hover:bg-slate-800 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            Initiate Transfer
          </button>
        </div>
      </header>

      {/* ERROR */}
      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-700 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-xs font-bold uppercase tracking-wide">{error}</span>
        </div>
      )}

      {/* ACCOUNT EXISTS */}
      {mainAccount ? (
        <div className="space-y-12">
          <section id="accounts">
             <div className="flex items-center gap-2 mb-4 px-1">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Master Ledger</h2>
            </div>
            <AccountCard user={user} account={mainAccount} />
          </section>

          <section
            id="balance"
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <BalanceCard
              title="Liquid Liquidity"
              amount={Number(mainAccount.balance) || 0}
              currency={mainAccount.currency}
              trend={2.4}
              type="available"
            />

            <BalanceCard
              title="Aggregate Portfolio"
              amount={ledgerBalance}
              currency={mainAccount.currency}
              type="ledger"
            />
          </section>

          <section id="transactions">
            <TransactionTable transactions={transactions} />
          </section>

          <section id="investments">
            <InvestmentCard />
          </section>

          <section id="settings">
            <div className="card border-slate-200/60 overflow-hidden">
               <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg shadow-sm">
                    <Settings className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight uppercase tracking-wide">
                      Security & Preferences
                    </h3>
                  </div>
                </div>
              </div>

              <div className="p-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mb-6">
                  <Settings className="w-7 h-7 text-slate-200" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Protocol Settings Restricted
                </h4>
                <p className="text-xs text-slate-400 font-medium max-w-[320px] leading-relaxed">
                  Advanced ledger configurations and automated rule-sets are currently locked under institutional audit.
                </p>
                <button className="mt-8 px-8 py-2 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] hover:bg-slate-50 transition-all">
                  Request Access
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : (
        <div className="py-32 border border-dashed border-slate-200 rounded-3xl bg-slate-50/20 flex flex-col items-center justify-center text-center px-6">
          <div className="w-20 h-20 bg-white border border-slate-200 rounded-2xl flex items-center justify-center mb-8 shadow-sm">
            <Plus className="w-8 h-8 text-slate-300" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-3">
            Initialize Master Ledger
          </h2>

          <p className="text-[13px] text-slate-400 max-w-[340px] mb-10 font-medium leading-relaxed">
            No active asset profile detected for this identity. Establish your primary digital ledger to activate portfolio intelligence.
          </p>

          <button
            onClick={createAccount}
            disabled={refreshing || loading}
            className="flex items-center gap-3 px-10 py-3.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all disabled:opacity-50"
          >
            {refreshing ? "Establishing Protocol..." : "Activate Master Profile"}
          </button>
        </div>
      )}

      {/* FOOTER SPACE */}
      <div className="h-20" />
    </div>
  );
};

export default Dashboard;


