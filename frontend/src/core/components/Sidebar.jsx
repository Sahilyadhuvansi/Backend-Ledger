import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Wallet,
  History,
  TrendingUp,
  Settings,
  ArrowLeftRight,
  ShieldCheck,
  CreditCard,
} from "lucide-react";
import { motion } from "framer-motion";

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    {
      name: "Accounts",
      path: "/dashboard#accounts",
      icon: Wallet,
      subItems: [{ name: "Account Details", path: "/accounts" }],
    },
    {
      name: "Transactions",
      path: "/dashboard#transactions",
      icon: ArrowLeftRight,
      subItems: [
        { name: "History", path: "/dashboard#transactions" },
        { name: "Transfer", path: "/transfer" },
      ],
    },
    {
      name: "Investments",
      path: "/dashboard#investments",
      icon: TrendingUp,
      subItems: [{ name: "Overview", path: "/dashboard#investments" }],
    },
    { name: "Settings", path: "/dashboard#settings", icon: Settings },
  ];

  return (
    <aside className="fixed left-0 top-20 bottom-0 w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col z-40">
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-4">
            Main Menu
          </p>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const baseItemPath = item.path.split("#")[0];
              const itemHash = item.path.split("#")[1];
              const isActive =
                location.pathname === baseItemPath &&
                location.hash === (itemHash ? `#${itemHash}` : "");
              const Icon = item.icon;

              return (
                <div key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-5 h-5 ${isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"}`}
                      />
                      <span className="font-semibold text-sm">{item.name}</span>
                    </div>
                  </Link>

                  {isActive && item.subItems && (
                    <div className="mt-1 ml-4 pl-4 border-l border-slate-100 space-y-1">
                      {item.subItems.map((sub) => (
                        <Link
                          key={sub.path}
                          to={sub.path}
                          className="block px-4 py-2 text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-100">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-4 text-white shadow-lg shadow-indigo-200">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-indigo-200" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-100">
                Premium Account
              </span>
            </div>
            <p className="text-xs font-medium mb-3 opacity-90 leading-relaxed">
              Unlock advanced analytics and higher transfer limits.
            </p>
            <button className="w-full py-2 bg-white text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-50 transition-colors">
              Upgrade Now
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 bg-slate-50/50 border-t border-slate-100">
        <div className="flex items-center gap-3 p-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
            <CreditCard className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Service Status
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-semibold text-slate-700">
                All Systems Online
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
