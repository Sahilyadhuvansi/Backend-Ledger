import { motion, AnimatePresence } from "framer-motion";
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
      element?.scrollIntoView({ behavior: "smooth", block: "start" });
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
    return mainAccount ? mainAccount.balance + 14500 : 0;
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
      <div className="space-y-8 animate-pulse">
        <div className="h-10 w-48 bg-slate-200 rounded-lg mb-8" />
        <div className="h-48 w-full bg-white rounded-3xl border border-slate-100" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-32 bg-white rounded-3xl border border-slate-100" />
          <div className="h-32 bg-white rounded-3xl border border-slate-100" />
        </div>
        <div className="h-96 w-full bg-white rounded-3xl border border-slate-100" />
      </div>
    );
  }

  /* ================= DASHBOARD ================= */

  return (
    <div className="space-y-8">
      {/* HEADER */}

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <LayoutDashboard className="w-4 h-4" />
            </div>

            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
              Workspace
            </span>
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Financial Dashboard
          </h1>

          <p className="text-slate-500 font-medium mt-1">
            Welcome back, {(user?.name || "User").split(" ")[0]}. Here's what's
            happening with your accounts today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => fetchData(true)}
            className={`p-3 rounded-2xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all ${
              refreshing ? "animate-spin" : ""
            }`}
          >
            <RefreshCw className="w-5 h-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/transfer")}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all"
          >
            <Send className="w-4 h-4 text-indigo-400" />
            Transfer Money
          </motion.button>
        </div>
      </header>

      {/* ERROR */}

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-bold">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ACCOUNT EXISTS */}

      {mainAccount ? (
        <div className="space-y-8">
          <div id="accounts" className="scroll-mt-24">
            <AccountCard user={user} account={mainAccount} />
          </div>

          <div
            id="balance"
            className="grid grid-cols-1 md:grid-cols-2 gap-6 scroll-mt-24"
          >
            <BalanceCard
              title="Available Balance"
              amount={Number(mainAccount.balance) || 0}
              currency={mainAccount.currency}
              trend={2.4}
              type="available"
            />

            <BalanceCard
              title="Ledger Balance"
              amount={ledgerBalance}
              currency={mainAccount.currency}
              type="ledger"
            />
          </div>

          <div id="transactions" className="scroll-mt-24">
            <TransactionTable transactions={transactions} />
          </div>

          <div id="investments" className="scroll-mt-24">
            <InvestmentCard />
          </div>

          <div id="settings" className="scroll-mt-24">
            <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Settings className="w-6 h-6" />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Platform Settings
                  </h2>

                  <p className="text-sm text-slate-500 font-medium">
                    Manage your account preferences and configurations
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
                <Settings className="w-12 h-12 text-slate-300 mb-4" />

                <p className="font-semibold text-slate-600">
                  Settings Coming Soon
                </p>

                <p className="text-sm">
                  We're working on bringing you more customization options.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-24 border-2 border-dashed border-slate-200 rounded-[3rem] bg-white flex flex-col items-center justify-center text-center px-6"
        >
          <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mb-8">
            <Plus className="w-10 h-10 text-indigo-600" />
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 mb-3">
            Initialize Your Ledger
          </h2>

          <p className="text-slate-500 max-w-sm mb-10 font-medium">
            You don't have any active accounts yet. Create your first digital
            ledger to start managing your assets securely.
          </p>

          <button
            onClick={createAccount}
            disabled={refreshing || loading}
            className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50"
          >
            {refreshing ? "Creating..." : "Create New Account"}
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;
