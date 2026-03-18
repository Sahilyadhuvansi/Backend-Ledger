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
  ExternalLink,
} from "lucide-react";

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { name: "Global Overview", path: "/dashboard", icon: LayoutDashboard },
    {
      name: "Asset Accounts",
      path: "/dashboard#accounts",
      icon: Wallet,
      subItems: [{ name: "Account Details", path: "/accounts" }],
    },
    {
      name: "Transaction Logs",
      path: "/dashboard#transactions",
      icon: ArrowLeftRight,
      subItems: [
        { name: "Audit Trail", path: "/dashboard#transactions" },
        { name: "New Transfer", path: "/transfer" },
      ],
    },
    {
      name: "Wealth Management",
      path: "/dashboard#investments",
      icon: TrendingUp,
      subItems: [{ name: "Allocations", path: "/dashboard#investments" }],
    },
    { name: "System Config", path: "/dashboard#settings", icon: Settings },
  ];

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col z-40">
      <div className="flex-1 overflow-y-auto py-8 px-5 space-y-10">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-3 mb-6">
            Ledger Navigation
          </p>
          <nav className="space-y-1.5">
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
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg transition-all group border ${
                      isActive
                        ? "bg-slate-50 border-slate-200 text-slate-900 shadow-sm shadow-slate-100/50"
                        : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 ${isActive ? "text-slate-900" : "text-slate-400 group-hover:text-slate-600"}`}
                      />
                      <span className="font-bold text-xs">{item.name}</span>
                    </div>
                  </Link>

                  {isActive && item.subItems && (
                    <div className="mt-1.5 ml-3.5 pl-4 border-l border-slate-100 space-y-1">
                      {item.subItems.map((sub) => (
                        <Link
                          key={sub.path}
                          to={sub.path}
                          className="block px-3 py-1.5 text-[11px] font-bold text-slate-400 hover:text-slate-900 transition-colors"
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
           <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-900">
                Tier: Institutional
              </span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 leading-relaxed">
              Limit: Unlimited Audit logs and increased liquidity transfers.
            </p>
            <button className="w-full py-2 bg-white border border-slate-200 text-slate-900 rounded-lg text-[10px] font-bold hover:bg-slate-50 transition-colors uppercase tracking-widest shadow-sm">
              Portfolio Stats
            </button>
          </div>
        </div>
      </div>

      <div className="p-5 bg-white border-t border-slate-100">
        <div className="flex items-center gap-3 p-1.5 bg-slate-50/50 rounded-xl border border-slate-100">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 shadow-sm">
            <CreditCard className="h-3.5 w-3.5" />
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">
              Services
            </p>
            <div className="flex items-center gap-1.5 mt-1.5 leading-none">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-700 uppercase">
                Operational
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

