import { motion } from "framer-motion";
import React from "react";
import Navbar from "./Navbar";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col relative overflow-x-hidden">
      {/* Soft Background Accent */}
      <div className="absolute top-0 w-full h-80 bg-gradient-to-b from-indigo-50 to-transparent pointer-events-none -z-10"></div>

      <Navbar />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="bg-white shadow-xl shadow-slate-200/50 border border-slate-100 rounded-3xl p-6 sm:p-10 min-h-[60vh]"
        >
          {children}
        </motion.div>
      </main>

      <footer className="mt-auto py-8 text-center border-t border-slate-200 bg-white/50 backdrop-blur-md">
        <p className="text-sm font-medium text-slate-500">
          Built securely with LedgerPro Protocol. Bank-grade encryption applied.
        </p>
      </footer>
    </div>
  );
};

export default Layout;
