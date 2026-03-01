import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, LayoutDashboard, Send, Fingerprint, Bell } from "lucide-react";

const NavLink = ({ to, icon: NavIcon, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={`relative flex items-center gap-2.5 px-4 py-2 rounded-xl transition-all duration-300 group ${
        isActive ? "text-white" : "text-slate-400 hover:text-slate-200"
      }`}
    >
      {isActive && (
        <motion.div
          layoutId="nav-bg"
          className="absolute inset-0 bg-white/10 rounded-xl backdrop-blur-md"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      {/* Icon removed as it was unused */}
      <span className="relative z-10 font-black text-xs uppercase tracking-widest hidden md:block">
        {children}
      </span>
    </Link>
  );
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl">
      <nav className="glass-panel py-3 px-6 flex items-center justify-between border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.8)] backdrop-blur-3xl bg-black/40 rounded-[2rem]">
        <div
          className="flex items-center gap-3 group cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:rotate-12 transition-transform">
            <Fingerprint className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-black tracking-tighter text-white hidden sm:block">
            Ledger<span className="text-indigo-400">Pro</span>
          </span>
        </div>

        <div className="flex items-center gap-1 md:gap-4 bg-white/5 p-1.5 rounded-2xl border border-white/5">
          <NavLink to="/dashboard" icon={LayoutDashboard}>
            Vault
          </NavLink>
          <NavLink to="/transfer" icon={Send}>
            Transact
          </NavLink>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex flex-col items-end mr-2">
            <span className="text-sm font-black text-white leading-none mb-1">
              {user?.name}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">
                Live Session
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 transition-all border border-white/5">
              <Bell className="w-5 h-5" />
            </button>
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-all border border-white/5 group"
            >
              <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
