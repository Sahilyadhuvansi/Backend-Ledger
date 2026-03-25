import React, { useState } from "react";
import { useAuth } from "../../core/context/AuthContext";
import {
  UserCircle2,
  Mail,
  AtSign,
  Calendar,
  Shield,
  LogOut,
  Edit2,
  Check,
} from "lucide-react";

const Profile = () => {
  const { user, logout } = useAuth();
  const [copied, setCopied] = useState(false);

  const handleCopyId = () => {
    if (!user?._id) return;
    navigator.clipboard.writeText(user._id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Recently";

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-8">
      {/* Header */}
      <header className="pb-6 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
            Account Profile
          </span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Identity & Settings</h1>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
          Manage your personal information and account preferences.
        </p>
      </header>

      {/* Profile Card */}
      <div className="card overflow-hidden">
        {/* Banner */}
        <div className="h-24 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 relative">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)", backgroundSize: "8px 8px" }}
          />
        </div>

        {/* Avatar + Name */}
        <div className="px-6 pb-6">
          <div className="-mt-8 mb-4 flex items-end justify-between">
            <div className="w-16 h-16 bg-white border-2 border-slate-200 rounded-2xl flex items-center justify-center shadow-sm">
              <UserCircle2 className="w-9 h-9 text-slate-500" />
            </div>
            <button
              disabled
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:bg-slate-50 transition-all"
            >
              <Edit2 className="w-3 h-3" />
              Edit Profile
            </button>
          </div>

          <h2 className="text-xl font-bold text-slate-900">{user?.name || "User"}</h2>
          <p className="text-sm text-slate-400 font-medium">@{user?.username || "username"}</p>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Email */}
        <div className="card p-5 flex items-start gap-4">
          <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Email Address</p>
            <p className="text-sm font-bold text-slate-900">{user?.email || "—"}</p>
          </div>
        </div>

        {/* Username */}
        <div className="card p-5 flex items-start gap-4">
          <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500">
            <AtSign className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Username</p>
            <p className="text-sm font-bold text-slate-900">@{user?.username || "—"}</p>
          </div>
        </div>

        {/* Member Since */}
        <div className="card p-5 flex items-start gap-4">
          <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Member Since</p>
            <p className="text-sm font-bold text-slate-900">{joinDate}</p>
          </div>
        </div>

        {/* Security */}
        <div className="card p-5 flex items-start gap-4">
          <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-600">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Security Status</p>
            <p className="text-sm font-bold text-emerald-600">Verified & Secured</p>
          </div>
        </div>
      </div>

      {/* User ID */}
      <div className="card p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Your Transfer ID</p>
            <p className="text-xs font-mono font-bold text-slate-600">
              Share this with others so they can transfer funds to you via username:&nbsp;
              <span className="text-indigo-600">@{user?.username}</span>
            </p>
          </div>
          <button
            onClick={handleCopyId}
            className="ml-4 flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 uppercase tracking-widest hover:bg-slate-50 transition-all flex-shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-500" />
                Copied!
              </>
            ) : (
              "Copy ID"
            )}
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card border-rose-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-rose-50 bg-rose-50/30">
          <h3 className="text-sm font-bold text-rose-700 uppercase tracking-wide">Danger Zone</h3>
        </div>
        <div className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-900">Sign out of your account</p>
            <p className="text-xs text-slate-400 font-medium mt-0.5">This will end your current session immediately.</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-rose-700 transition-all shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </div>

      <div className="h-12" />
    </div>
  );
};

export default Profile;
