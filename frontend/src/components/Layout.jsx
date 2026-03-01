import React from "react";
import Navbar from "./Navbar";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-50 selection:bg-indigo-500/30 font-sans flex flex-col relative overflow-x-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse opacity-30"></div>
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse opacity-30"
          style={{ animationDelay: "2s" }}
        ></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.03)_0%,transparent_70%)]"></div>
      </div>

      <Navbar />

      <main className="relative z-10 pt-28 pb-20 px-4 sm:px-8 max-w-5xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="glass-panel border border-white/10 backdrop-blur-2xl bg-white/[0.04] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] rounded-3xl p-6 sm:p-12 overflow-hidden"
        >
          {children}
        </motion.div>
      </main>

      {/* Footer / Status Bar Area */}
      <footer className="mt-auto py-6 px-8 text-center border-t border-white/5 bg-black/20 backdrop-blur-md">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">
          Professional Ledger Protocol v2.5 • End-to-End Encrypted
        </p>
      </footer>
    </div>
  );
};

export default Layout;
