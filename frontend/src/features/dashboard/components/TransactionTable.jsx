import React from "react";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Filter,
  MoreHorizontal,
  Clock,
  ArrowRight,
} from "lucide-react";

const TransactionTable = ({ transactions = [] }) => {
  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "N/A";

  const formatTime = (date) =>
    date
      ? new Date(date).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "N/A";

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/30">
        <div>
          <h3 className="text-base font-bold text-slate-900 leading-none">
            Recent Ledger Activity
          </h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1.5">
            Total {transactions.length} entries located
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 bg-white text-slate-400 border border-slate-200 rounded-lg hover:text-slate-600 hover:bg-slate-50 transition-colors">
            <Search className="w-3.5 h-3.5" />
          </button>

          <button className="flex items-center gap-2 px-3 py-1.5 bg-white text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all text-[10px] font-bold uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5" />
            Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Identifier & Description
              </th>

              <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden md:table-cell">
                Methodology
              </th>

              <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Amount
              </th>

              <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Status
              </th>

              <th className="px-6 py-3 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Audit
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-50">
            {transactions.length > 0 ? (
              transactions.map((tx) => {
                if (!tx) return null;

                const isDebit =
                  tx.type === "debit" || tx.type === "transfer_out";

                const txId = tx._id
                  ? `TXN-${String(tx._id).slice(-6).toUpperCase()}`
                  : "TXN-NEW";

                return (
                  <tr key={tx._id || txId} className="group hover:bg-slate-50/40">
                    {/* Transaction */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                            isDebit
                              ? "bg-rose-50 text-rose-600 border-rose-100"
                              : "bg-emerald-50 text-emerald-600 border-emerald-100"
                          }`}
                        >
                          {isDebit ? (
                            <ArrowUpRight className="w-4 h-4" />
                          ) : (
                            <ArrowDownLeft className="w-4 h-4" />
                          )}
                        </div>

                        <div>
                          <p className="text-sm font-bold text-slate-900 leading-tight">
                            {tx.description ||
                              (isDebit ? "External Transfer" : "Inward Remittance")}
                          </p>

                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap">
                              {formatDate(tx.createdAt)}
                            </span>
                            <span className="text-[10px] text-slate-300">•</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap">
                              {formatTime(tx.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Method */}
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                          {txId}
                        </p>
                        <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-wider">
                          Digital Ledger Entry
                        </p>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <p
                          className={`text-sm font-bold ${
                            isDebit ? "text-rose-600" : "text-emerald-600"
                          }`}
                        >
                          {isDebit ? "-" : "+"}₹
                          {(tx.amount || 0).toLocaleString("en-IN")}
                        </p>

                        <p className="text-[9px] font-bold text-slate-400 uppercase">
                          Settled in {tx.currency || "INR"}
                        </p>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                          tx.status === "completed"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                            : "bg-amber-50 text-amber-600 border-amber-100"
                        }`}
                      >
                        {tx.status || "pending"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-300 hover:text-slate-500 transition-colors p-1.5 rounded-md hover:bg-white border border-transparent hover:border-slate-200">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-16 text-center text-slate-400 font-medium text-xs bg-slate-50/20"
                >
                  No transaction data available in current ledger.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-3.5 bg-slate-50/50 border-t border-slate-100 flex justify-center">
        <button className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest group">
          Open Full Audit Logs
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default TransactionTable;

