import { motion } from "framer-motion";
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LogOut,
  LayoutDashboard,
  Send,
  UserCircle2,
  WalletCards,
} from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navLinks = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Transfer Funds", path: "/transfer", icon: Send },
  ];

  if (!user) return null;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-12">
              {/* Logo */}
              <Link to="/dashboard" className="flex items-center gap-3">
                <div className="bg-indigo-600 p-2 rounded-xl">
                  <WalletCards className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  LedgerPro
                </span>
              </Link>

              {/* Desktop Nav */}
              <div className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => {
                  const isActive = location.pathname.includes(link.path);
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                        isActive
                          ? "bg-slate-100 text-indigo-700"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {link.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-4 sm:gap-6">
              <div className="hidden sm:flex items-center gap-3 text-right">
                <div>
                  <p className="text-sm font-bold text-slate-800 leading-none mb-1">
                    {user.name}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">
                    Verified User
                  </p>
                </div>
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                  <UserCircle2 className="w-6 h-6 text-slate-400" />
                </div>
              </div>

              <button
                onClick={logout}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-500 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 pb-safe">
        <div className="flex items-center justify-around h-16">
          {navLinks.map((link) => {
            const isActive = location.pathname.includes(link.path);
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                  isActive ? "text-indigo-600" : "text-slate-500"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${isActive ? "opacity-100" : "opacity-70"}`}
                />
                <span
                  className={`text-[10px] font-bold ${isActive ? "opacity-100" : "opacity-70"}`}
                >
                  {link.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Navbar;
