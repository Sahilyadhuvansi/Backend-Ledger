import React from "react";
import { TrendingUp, PieChart, Calendar, ArrowRight } from "lucide-react";

const InvestmentCard = () => {
  const investments = [
    {
      id: 1,
      type: "Fixed Deposit",
      rate: 7.5,
      maturity: "12 Dec 2026",
      amount: 500000,
    },
    {
      id: 2,
      type: "Mutual Funds",
      rate: 12.2,
      maturity: "N/A",
      amount: 250000,
    },
  ];

  return (
    <div className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-50 text-violet-600 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Investments & Deposits
            </h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
              Your portfolio growth
            </p>
          </div>
        </div>

        <button className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:underline">
          Explore Markets
        </button>
      </div>

      {/* Investment Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {investments.map((inv) => (
            <div
              key={inv.id}
              className="p-4 rounded-2xl border border-slate-100 bg-slate-50/30 hover:bg-white hover:border-violet-100 hover:shadow-lg hover:shadow-violet-100/20 transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white border border-slate-100 rounded-lg flex items-center justify-center text-violet-600">
                    <PieChart className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">
                    {inv.type}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">
                  {inv.rate}% P.A.
                </div>
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                    Estimated Value
                  </p>
                  <p className="text-sm font-extrabold text-slate-900">
                    ₹{inv.amount.toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    <Calendar className="w-2.5 h-2.5" />
                    Maturity
                  </div>
                  <p className="text-[10px] font-bold text-slate-700">
                    {inv.maturity}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Investment Offer Banner */}
        <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-700 text-white flex items-center justify-between shadow-lg shadow-indigo-100 relative overflow-hidden">
          <div className="relative z-10">
            <h4 className="text-xs font-bold mb-1">
              New Investment Opportunity
            </h4>
            <p className="text-[10px] opacity-80 font-medium">
              Earn up to 8.5% on Fixed Deposits. Limited time only!
            </p>
          </div>

          <button className="relative z-10 p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all group">
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
        </div>
      </div>
    </div>
  );
};

export default InvestmentCard;
