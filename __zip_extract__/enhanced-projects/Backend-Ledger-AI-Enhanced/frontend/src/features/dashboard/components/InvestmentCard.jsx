import React from "react";
import { TrendingUp, PieChart, Calendar, ArrowRight } from "lucide-react";

const InvestmentCard = () => {
  const investments = [
    {
      id: 1,
      type: "Secured Fixed Deposit",
      rate: 7.5,
      maturity: "12 Dec 2026",
      amount: 500000,
    },
    {
      id: 2,
      type: "Diversified Mutual Funds",
      rate: 12.2,
      maturity: "N/A",
      amount: 250000,
    },
  ];

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg shadow-sm">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-tight">
              Managed Investment Portfolio
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
              Active wealth allocations
            </p>
          </div>
        </div>

        <button className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-slate-900 transition-colors">
          Audit Portfolio
        </button>
      </div>

      {/* Investment Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {investments.map((inv) => (
            <div
              key={inv.id}
              className="p-5 rounded-xl border border-slate-100 bg-slate-50/20 hover:bg-slate-50/50 transition-all"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 bg-white border border-slate-200 rounded flex items-center justify-center text-slate-500 shadow-sm">
                    <PieChart className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm font-bold text-slate-800">
                    {inv.type}
                  </span>
                </div>

                <div className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-wider">
                   {inv.rate}% APR
                </div>
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-2">
                    Principal Allocation
                  </p>
                  <p className="text-lg font-bold text-slate-900 leading-none">
                    ₹{inv.amount.toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 overflow-hidden">
                    <Calendar className="w-2.5 h-2.5 flex-shrink-0" />
                    Maturity
                  </div>
                  <p className="text-[10px] font-bold text-slate-600 leading-none">
                    {inv.maturity}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Opportunity Card (Minimalist) */}
        <div className="mt-6 p-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/30 flex items-center justify-between group cursor-pointer hover:border-slate-300 transition-all">
          <div>
            <h4 className="text-xs font-bold text-slate-800 mb-1">
              New Capital Allocation Opportunity
            </h4>
            <p className="text-[10px] text-slate-500 font-medium">
              Fixed deposits yielding up to 8.50% p.a. available for secure ledger placement.
            </p>
          </div>

          <div className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 group-hover:text-slate-900 group-hover:border-slate-300 transition-all shadow-sm">
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentCard;

