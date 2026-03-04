import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../core/utils/api";
import { useSocket } from "../../core/context/SocketContext";
import { useAuth } from "../../core/context/AuthContext";
import {
  Plus,
  Send,
  AlertCircle,
  RefreshCw,
  LayoutDashboard,
} from "lucide-react";

// Components
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
  const { lastUpdate } = useSocket();
  const { user } = useAuth();

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const [accountsRes, transactionsRes] = await Promise.all([
        api.get("/accounts"),
        api.get("/transactions/history?limit=5"),
      ]);

      setAccounts(accountsRes.data.data);
      setTransactions(transactionsRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, lastUpdate]);

  const createAccount = async () => {
    try {
      setRefreshing(true);
      await api.post("/accounts", { currency: "INR" });
      await fetchData(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setRefreshing(false);
    }
  };

  const mainAccount = accounts[0];

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

  return (
    <div className="space-y-8">
      {/* Header Section */}
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
            className={`p-3 rounded-2xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all ${refreshing ? "animate-spin" : ""}`}
            title="Refresh Data"
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
            <span>Transfer Money</span>
          </motion.button>
        </div>
      </header>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-bold">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Account Overview Card (Top) */}
      {mainAccount ? (
        <>
          <AccountCard user={user} account={mainAccount} />

          {/* 2. Balance Cards (Top center) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BalanceCard
              title="Available Balance"
              amount={mainAccount.balance}
              currency={mainAccount.currency}
              trend={2.4}
              type="available"
            />
            <BalanceCard
              title="Ledger Balance"
              amount={mainAccount.balance + 14500} // Mocking ledger balance for demo
              currency={mainAccount.currency}
              type="ledger"
            />
          </div>

          {/* 3. Recent Transactions Table (Middle) */}
          <TransactionTable transactions={transactions} />

          {/* 4. Investments / Deposits (Bottom) */}
          <InvestmentCard />
        </>
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
            disabled={refreshing}
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
