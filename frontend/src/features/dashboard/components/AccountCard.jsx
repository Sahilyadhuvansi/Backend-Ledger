import React from "react";
import {
  User,
  CreditCard,
  Calendar,
  Fingerprint,
  ShieldCheck,
  Copy,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";

const AccountCard = ({ user = {}, account }) => {
  const [copied, setCopied] = React.useState(false);

  if (!account) return null;

  const fullAccountNumber = account?._id ? String(account._id) : "";
  const accountNumber = fullAccountNumber
    ? `***${fullAccountNumber.slice(-6).toUpperCase()}`
    : "******";

  const handleCopy = () => {
    if (!fullAccountNumber) return;
    navigator.clipboard.writeText(fullAccountNumber);
    setCopied(true);
    toast.success("Ledger ID copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

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
            <button
              onClick={handleCopy}
              className="ml-1 p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
              title="Copy full Ledger ID"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
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
