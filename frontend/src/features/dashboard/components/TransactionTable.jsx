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

const TransactionTable = ({ transactions }) => {
  return (
    <div className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm">
      <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Recent Transactions
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Monitoring your latest ledger activity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 transition-colors">
            <Search className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-all text-xs font-bold">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-default">
                Transaction
              </th>
              <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-default hidden md:table-cell">
                ID & Method
              </th>
              <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-default">
                Amount
              </th>
              <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-default">
                Status
              </th>
              <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-default">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {Array.isArray(transactions) && transactions.length > 0 ? (
              transactions.map((tx) => {
                if (!tx) return null;
                const isDebit =
                  tx.type === "debit" || tx.type === "transfer_out";
                return (
                  <tr
                    key={tx._id || Math.random()}
                    className="hover:bg-slate-50/80 transition-all group"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            isDebit
                              ? "bg-rose-50 text-rose-600"
                              : "bg-emerald-50 text-emerald-600"
                          }`}
                        >
                          {isDebit ? (
                            <ArrowUpRight className="w-5 h-5" />
                          ) : (
                            <ArrowDownLeft className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 tracking-tight">
                            {tx.description ||
                              (isDebit ? "Money Sent" : "Money Received")}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                              {tx.createdAt
                                ? new Date(tx.createdAt).toLocaleDateString()
                                : "N/A"}{" "}
                              •{" "}
                              {tx.createdAt
                                ? new Date(tx.createdAt).toLocaleTimeString(
                                    [],
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    },
                                  )
                                : "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 hidden md:table-cell">
                      <div className="space-y-1">
                        <p className="text-xs font-mono font-bold text-slate-500 uppercase">
                          TXN-
                          {String(tx._id || "")
                            .slice(-8)
                            .toUpperCase() || "NEW"}
                        </p>
                        <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider bg-indigo-50 inline-block px-1.5 py-0.5 rounded">
                          Digital Transfer
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-0.5">
                        <p
                          className={`text-sm font-extrabold ${isDebit ? "text-rose-600" : "text-emerald-600"}`}
                        >
                          {isDebit ? "-" : "+"}
                          {(tx.amount || 0).toLocaleString()}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">
                          {tx.currency || "INR"}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          tx.status === "completed"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                            : "bg-amber-50 text-amber-600 border-amber-100"
                        }`}
                      >
                        {tx.status || "pending"}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-xl group-hover:bg-white border border-transparent group-hover:border-slate-200">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-12 text-center text-slate-400 italic"
                >
                  No recent transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-center">
        <button className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-widest group">
          View All Transactions
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default TransactionTable;
