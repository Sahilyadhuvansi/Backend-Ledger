import React from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";

const BalanceCard = ({ title, amount, currency, trend, type }) => {
  const isAvailable = type === "available";

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`relative overflow-hidden p-6 rounded-3xl border transition-all ${
        isAvailable
          ? "bg-white border-indigo-100 shadow-xl shadow-indigo-100/20"
          : "bg-slate-900 border-slate-800 shadow-xl shadow-slate-900/20 text-white"
      }`}
    >
      <div className="flex justify-between items-start mb-6">
        <div
          className={`p-2.5 rounded-xl ${isAvailable ? "bg-indigo-50 text-indigo-600" : "bg-white/10 text-indigo-400"}`}
        >
          <Wallet className="w-5 h-5" />
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${
              trend > 0
                ? isAvailable
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-emerald-500/20 text-emerald-400"
                : isAvailable
                  ? "bg-rose-50 text-rose-600"
                  : "bg-rose-500/20 text-rose-400"
            }`}
          >
            {trend > 0 ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownLeft className="w-3 h-3" />
            )}
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      <div>
        <p
          className={`text-xs font-bold uppercase tracking-wider mb-1 ${isAvailable ? "text-slate-400" : "text-slate-500"}`}
        >
          {title}
        </p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl font-extrabold tracking-tight">
            {amount.toLocaleString()}
          </h3>
          <span
            className={`text-xs font-bold uppercase ${isAvailable ? "text-slate-400" : "text-slate-500"}`}
          >
            {currency}
          </span>
        </div>
      </div>

      {/* Decorative background element */}
      <div
        className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-2xl opacity-20 pointer-events-none ${
          isAvailable ? "bg-indigo-400" : "bg-indigo-600"
        }`}
      />
    </motion.div>
  );
};

export default BalanceCard;
