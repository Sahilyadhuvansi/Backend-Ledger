import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, LayoutDashboard, Send, Wallet } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-none border-b border-white/10 rounded-none h-16 px-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Wallet className="w-8 h-8 text-indigo-500" />
        <span className="gradient-text text-xl">LedgerPro</span>
      </div>

      <div className="flex items-center gap-6">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
        >
          <LayoutDashboard className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="font-medium hidden md:block">Dashboard</span>
        </Link>
        <Link
          to="/transfer"
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
        >
          <Send className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="font-medium hidden md:block">Transfer</span>
        </Link>
        <div className="h-4 w-px bg-white/10 mx-2"></div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-semibold text-white">
              {user?.name}
            </span>
            <span className="text-xs text-slate-400">{user?.email}</span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2.5 rounded-full bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-all duration-300"
            title="Log Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
