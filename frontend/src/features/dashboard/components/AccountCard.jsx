import React from "react";
import {
  User,
  CreditCard,
  Calendar,
  Fingerprint,
  ShieldCheck,
} from "lucide-react";

const AccountCard = ({ user = {}, account }) => {
  if (!account) return null;

  const accountNumber = account?._id
    ? `***${String(account._id).slice(-6).toUpperCase()}`
    : "******";

  const openDate = account?.createdAt
    ? new Date(account.createdAt).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "N/A";

  return (
    <div className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          Account Overview
        </h3>

        <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-100 uppercase tracking-tighter">
          Verified
        </span>
      </div>

      {/* Content */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Account Holder */}
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Account Holder
          </p>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-bold text-slate-700">
              {user?.name || "User"}
            </span>
          </div>
        </div>

        {/* Account Number */}
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Account Number
          </p>
          <div className="flex items-center gap-2">
            <Fingerprint className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-mono font-bold text-slate-700">
              {accountNumber}
            </span>
          </div>
        </div>

        {/* Account Type */}
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Account Type
          </p>
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-bold text-slate-700">
              Digital Ledger ({account?.currency || "INR"})
            </span>
          </div>
        </div>

        {/* Open Date */}
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Open Date
          </p>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-bold text-slate-700">{openDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountCard;
