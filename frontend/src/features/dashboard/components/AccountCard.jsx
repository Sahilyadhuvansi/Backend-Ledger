import React from "react";
import { motion } from "framer-motion";
import {
  User,
  CreditCard,
  Calendar,
  Fingerprint,
  ShieldCheck,
} from "lucide-react";

const AccountCard = ({ user, account }) => {
  if (!account) return null;

  return (
    <div className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm">
      <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          Account Overview
        </h3>
        <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-100 uppercase tracking-tighter">
          Verified
        </span>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Account Holder
          </p>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-bold text-slate-700">
              {user.name}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Account Number
          </p>
          <div className="flex items-center gap-2">
            <Fingerprint className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-mono font-bold text-slate-700">
              ***{account._id.slice(-6).toUpperCase()}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Account Type
          </p>
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-bold text-slate-700">
              Digital Ledger ({account.currency})
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Open Date
          </p>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-bold text-slate-700">
              {new Date(account.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountCard;
