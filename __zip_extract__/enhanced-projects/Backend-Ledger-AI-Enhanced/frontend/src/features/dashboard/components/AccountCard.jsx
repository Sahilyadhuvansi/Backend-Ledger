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
    toast.success("Ledger identity copied to clipboard");
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
    <div className="card">
      {/* Header */}
      <div className="bg-slate-50/50 border-b border-slate-100 px-6 py-4 flex justify-between items-center bg-slate-50/10">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          Identification Profile
        </h3>

        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 uppercase tracking-wider">
            Active Status
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Account Holder */}
        <div className="space-y-2">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">
            Custodian
          </p>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-sm font-bold text-slate-900 leading-none">
                {user?.name || "User"}
              </span>
            </div>
            {user?.username && (
              <span className="text-[10px] font-bold text-slate-400 ml-5.5 mt-1.5 leading-none">
                @{user.username}
              </span>
            )}
          </div>
        </div>

        {/* Account Number */}
        <div className="space-y-2">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">
            Digital Identity
          </p>
          <div className="flex items-center gap-2">
            <Fingerprint className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] font-mono font-bold text-slate-900 leading-none tracking-tight">
              {accountNumber}
            </span>
            <button
              onClick={handleCopy}
              className="ml-0.5 p-1 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
              title="Copy Audit ID"
            >
              {copied ? (
                <Check className="w-3 h-3 text-emerald-500" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          </div>
        </div>

        {/* Account Type */}
        <div className="space-y-2">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">
            Asset Protocol
          </p>
          <div className="flex items-center gap-2">
            <CreditCard className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-sm font-bold text-slate-900 leading-none">
              Ledger Account ({account?.currency || "INR"})
            </span>
          </div>
        </div>

        {/* Open Date */}
        <div className="space-y-2">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">
            Origination Date
          </p>
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-sm font-bold text-slate-900 leading-none">{openDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountCard;

