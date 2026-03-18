import React from "react";
import { Wallet, ArrowUpRight, ArrowDownLeft } from "lucide-react";

const BalanceCard = ({
  title = "Balance",
  amount = 0,
  currency = "INR",
  trend = null,
  type = "available",
}) => {
  const isAvailable = type === "available";
  const isPositive = trend > 0;

  const formattedAmount = amount.toLocaleString("en-IN");

  return (
    <div
      className={`relative p-6 rounded-2xl border transition-all ${
        isAvailable
          ? "bg-white border-slate-200/80 shadow-sm"
          : "bg-slate-900 border-slate-800 text-white shadow-md shadow-slate-900/10"
      }`}
    >
      {/* Top Section */}
      <div className="flex justify-between items-start mb-6">
        <div
          className={`p-2 rounded-lg ${
            isAvailable
              ? "bg-slate-50 text-slate-600 border border-slate-100"
              : "bg-white/10 text-slate-300"
          }`}
        >
          <Wallet className="w-4 h-4" />
        </div>

        {trend !== null && (
          <div
            className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isPositive
                ? isAvailable
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                  : "bg-emerald-500/20 text-emerald-400"
                : isAvailable
                  ? "bg-rose-50 text-rose-600 border border-rose-100"
                  : "bg-rose-500/20 text-rose-400"
            }`}
          >
            {isPositive ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownLeft className="w-3 h-3" />
            )}
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      {/* Balance Section */}
      <div>
        <p
          className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 ${
            isAvailable ? "text-slate-400" : "text-slate-500"
          }`}
        >
          {title}
        </p>

        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl font-bold tracking-tight">
            ₹{formattedAmount}
          </h3>

          <span
            className={`text-xs font-bold uppercase ${
              isAvailable ? "text-slate-400" : "text-slate-500"
            }`}
          >
            {currency}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;

