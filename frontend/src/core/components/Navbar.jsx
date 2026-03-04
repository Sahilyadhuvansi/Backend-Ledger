import { motion, AnimatePresence } from "framer-motion";
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
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-slate-200/60 transition-all duration-300">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Left: Logo */}
            <div className="flex items-center gap-12">
              <Link to="/dashboard" className="flex items-center gap-3 group">
                <div className="bg-indigo-600 p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300">
                  <WalletCards className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent hidden sm:inline-block">
                  LedgerPro
                </span>
              </Link>
            </div>

            {/* Center: Search */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200/60 rounded-2xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                  placeholder="Search transactions, accounts, or help..."
                />
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-2.5 rounded-xl transition-all relative ${
                    showNotifications
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-200/50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                        <span className="font-bold text-sm">Notifications</span>
                        <span className="text-[10px] font-bold text-indigo-600 cursor-pointer">
                          Mark all as read
                        </span>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        <div className="p-4 text-center text-xs text-slate-400 italic">
                          No new notifications
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Profile Dropdown */}
              <div className="relative ml-2">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className={`flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-xl transition-all border ${
                    showProfileMenu
                      ? "bg-white border-slate-200 shadow-sm"
                      : "border-transparent hover:bg-slate-50"
                  }`}
                >
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-bold text-slate-800 leading-none">
                      {user.name}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-wider">
                      Premium Member
                    </p>
                  </div>
                  <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center border border-indigo-100/50">
                    <UserCircle2 className="w-5 h-5 text-indigo-600" />
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${showProfileMenu ? "rotate-180" : ""}`}
                  />
                </button>

                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-56 bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-200/50 overflow-hidden"
                    >
                      <div className="p-2">
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
                        >
                          <UserCircle2 className="w-4 h-4" />
                          My Profile
                        </Link>
                        <Link
                          to="/dashboard#settings"
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
                        >
                          <Settings className="w-4 h-4" />
                          Settings
                        </Link>
                        <div className="h-px bg-slate-100 my-1" />
                        <button
                          onClick={logout}
                          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-all"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-3xl px-6 py-4 shadow-2xl">
        <div className="flex items-center justify-between">
          {[
            { icon: LayoutDashboard, path: "/dashboard" },
            { icon: CreditCard, path: "/dashboard#accounts" },
            { icon: Send, path: "/transfer" },
            { icon: History, path: "/dashboard#transactions" },
            { icon: Settings, path: "/dashboard#settings" },
          ].map((item, idx) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={idx}
                to={item.path}
                className={`p-2 rounded-xl transition-all ${
                  isActive ? "bg-indigo-600 text-white" : "text-slate-400"
                }`}
              >
                <Icon className="w-5 h-5" />
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Navbar;
