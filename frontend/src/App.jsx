import React, { Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider, useAuth } from "./core/context/AuthContext";
import { SocketProvider } from "./core/context/SocketContext";

import Layout from "./core/components/Layout";

import Login from "./features/auth/Login";
import Register from "./features/auth/Register";
import Dashboard from "./features/dashboard/Dashboard";
import AccountDetails from "./features/accounts/AccountDetails";
import Transfer from "./features/transactions/Transfer";

import { Toaster } from "react-hot-toast";
import "./index.css";

/* ================= LOADING SCREEN ================= */

const PageLoader = () => (
  <div className="min-h-screen bg-[#030712] flex items-center justify-center">
    <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
  </div>
);

/* ================= PROTECTED ROUTE ================= */

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;

  if (!user) return <Navigate to="/login" replace />;

  return <Layout>{children}</Layout>;
};

/* ================= APP ================= */

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <Suspense fallback={<PageLoader />}>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "#0f172a",
                  color: "#fff",
                  borderRadius: "12px",
                },
              }}
            />

            <Routes>
              {/* Public Routes */}

              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes */}

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/accounts/:id"
                element={
                  <ProtectedRoute>
                    <AccountDetails />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/transfer"
                element={
                  <ProtectedRoute>
                    <Transfer />
                  </ProtectedRoute>
                }
              />

              {/* Default Routes */}

              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
