import { motion } from "framer-motion";
import React from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col relative overflow-x-hidden">
      {/* Soft Background Accent */}
      <div className="absolute top-0 w-full h-[500px] bg-gradient-to-b from-indigo-50/50 via-white to-transparent pointer-events-none -z-10"></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute top-[20%] -left-24 w-72 h-72 bg-violet-500/5 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <Navbar />

      <div className="flex flex-1 pt-20">
        <Sidebar />

        <main className="flex-1 w-full lg:ml-64 transition-all duration-300">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>

      <footer className="w-full lg:pl-64 border-t border-slate-200 bg-white/50 backdrop-blur-md transition-all duration-300">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-indigo-600 p-1.5 rounded-lg">
                  <div className="w-4 h-4 bg-white rounded-md" />
                </div>
                <span className="text-lg font-bold text-slate-900">
                  LedgerPro
                </span>
              </div>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                Next-generation banking infrastructure for digital assets and
                secure ledger management.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">
                Support
              </h4>
              <ul className="space-y-4">
                <li>
                  <a
                    href="#"
                    className="text-sm text-slate-500 hover:text-indigo-600 font-medium transition-colors"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-slate-500 hover:text-indigo-600 font-medium transition-colors"
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-slate-500 hover:text-indigo-600 font-medium transition-colors"
                  >
                    Security Advisor
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">
                Policies
              </h4>
              <ul className="space-y-4">
                <li>
                  <a
                    href="#"
                    className="text-sm text-slate-500 hover:text-indigo-600 font-medium transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-slate-500 hover:text-indigo-600 font-medium transition-colors"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-slate-500 hover:text-indigo-600 font-medium transition-colors"
                  >
                    Compliance
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">
                Apps
              </h4>
              <div className="flex flex-col gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors">
                  <span>App Store</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors">
                  <span>Google Play</span>
                </button>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs font-semibold text-slate-400">
              © 2026 LedgerPro Protocol. Bank-grade encryption applied.
            </p>
            <div className="flex gap-6">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                PCI-DSS Compliant
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                ISO 27001
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
