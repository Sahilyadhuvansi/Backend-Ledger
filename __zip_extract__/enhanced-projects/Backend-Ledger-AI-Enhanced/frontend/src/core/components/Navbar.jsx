import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LogOut,
  LayoutDashboard,
  Send,
  UserCircle2,
  WalletCards,
  Search,
  Bell,
  Settings,
  ChevronDown,
  CreditCard,
  History,
} from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  if (!user) return null;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 transition-all duration-200 h-16">
        <div className="max-w-[1600px] mx-auto px-6 h-full">
          <div className="flex justify-between items-center h-full">
            {/* Left: Logo */}
            <div className="flex items-center gap-12">
              <Link to="/dashboard" className="flex items-center gap-2.5 group">
                <div className="bg-slate-900 p-1.5 rounded shadow-sm group-hover:bg-slate-800 transition-colors">
                  <WalletCards className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-slate-900 tracking-tight hidden sm:inline-block">
                  Ledger<span className="text-slate-400">Pro</span>
                </span>
              </Link>
            </div>

            {/* Center: Search */}
            <div className="hidden md:flex flex-1 max-w-lg mx-12">
              <div className="relative w-full group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Search className="h-3.5 w-3.5 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-200 focus:border-slate-300 transition-all font-medium"
                  placeholder="Audit trail search, accounts, or support..."
                />
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-2 rounded-lg transition-all relative border ${
                    showNotifications
                      ? "bg-slate-50 border-slate-200 text-slate-900 shadow-sm"
                      : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                      <span className="font-bold text-xs uppercase tracking-widest text-slate-500">Notifications</span>
                      <span className="text-[10px] font-bold text-slate-400 hover:text-slate-900 cursor-pointer transition-colors uppercase tracking-tighter">
                        Clear Audit
                      </span>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      <div className="p-8 text-center text-[11px] font-bold text-slate-300 uppercase tracking-widest italic">
                        No System Alerts
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className={`flex items-center gap-2 pl-2 pr-1.5 py-1.5 rounded-lg transition-all border ${
                    showProfileMenu
                      ? "bg-slate-50 border-slate-200 shadow-sm"
                      : "border-transparent hover:bg-slate-50"
                  }`}
                >
                  <div className="hidden sm:block text-right">
                    <p className="text-[11px] font-bold text-slate-900 leading-none">
                      {user.name}
                    </p>
                  </div>
                  <div className="w-7 h-7 bg-slate-100 rounded border border-slate-200 flex items-center justify-center">
                    <UserCircle2 className="w-4 h-4 text-slate-500" />
                  </div>
                  <ChevronDown
                    className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${showProfileMenu ? "rotate-180" : ""}`}
                  />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-3 w-56 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-2">
                       <div className="px-3 py-2 mb-1">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Signed in as</p>
                        <p className="text-[11px] font-bold text-slate-900 truncate">@{user.username || "user"}</p>
                      </div>
                      <div className="h-px bg-slate-100 mb-1 mx-2" />
                      <Link
                        to="/profile"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all uppercase tracking-tight"
                      >
                        <UserCircle2 className="w-3.5 h-3.5" />
                        Account Profile
                      </Link>
                      <Link
                        to="/dashboard#settings"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all uppercase tracking-tight"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        System Config
                      </Link>
                      <div className="h-px bg-slate-100 my-1 mx-2" />
                      <button
                        onClick={logout}
                        className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all uppercase tracking-tight"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Terminate Session
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl px-6 py-3 shadow-xl">
        <div className="flex items-center justify-between">
          {[
            { icon: LayoutDashboard, path: "/dashboard", hash: "" },
            { icon: CreditCard, path: "/dashboard", hash: "accounts" },
            { icon: Send, path: "/transfer", hash: "" },
            { icon: History, path: "/dashboard", hash: "transactions" },
            { icon: Settings, path: "/dashboard", hash: "settings" },
          ].map((item, idx) => {
            const currentHash = location.hash.replace("#", "");
            const isActive =
              location.pathname === item.path && currentHash === item.hash;

            const fullPath = item.hash ? `${item.path}#${item.hash}` : item.path;
            const Icon = item.icon;

            const handleClick = () => {
              if (location.pathname === item.path && item.hash) {
                const element = document.getElementById(item.hash);
                if (element) {
                  element.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }
              if (location.pathname === item.path && !item.hash && item.path === "/dashboard") {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            };

            return (
              <Link
                key={idx}
                to={fullPath}
                onClick={handleClick}
                className={`p-2 rounded-lg transition-all ${
                  isActive
                    ? "bg-slate-900 text-white shadow-md shadow-slate-200"
                    : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-4 h-4" />
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Navbar;

