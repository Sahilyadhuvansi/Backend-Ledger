// ─── Commit: Core React imports ───
// What this does: Loads React and 'Suspense' for asynchronous component loading.
// Why it exists: React is the foundation of our UI. Suspense allows us to show a placeholder while components load.
import React, { Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// ─── Commit: Context Architecture (Provider Pattern) ───
// What this does: Brings in our global state managers (Auth for login, Socket for real-time).
// Why it exists: Instead of passing info from parent to child ("Prop Drilling"), we use Context to make data available everywhere.
import { AuthProvider, useAuth } from "./core/context/AuthContext";
import { SocketProvider } from "./core/context/SocketContext";

import Layout from "./core/components/Layout";

// ─── Commit: Feature Component Imports ───
// What this does: Loads the actual screens of our app (Login, Dashboard, etc.).
import Login from "./features/auth/Login";
import Register from "./features/auth/Register";
import Dashboard from "./features/dashboard/Dashboard";
import AccountDetails from "./features/accounts/AccountDetails";
import Transfer from "./features/transactions/Transfer";

import { Toaster } from "react-hot-toast";
import "./index.css";

/* ================= LOADING SCREEN ================= */
// ─── Commit: UX Loading Feedback ───
// What this does: Displays a professional Indigo spinner while the app boots up.
const PageLoader = () => (
  <div className="min-h-screen bg-[#030712] flex items-center justify-center">
    <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
  </div>
);

/* ================= PROTECTED ROUTE ================= */
// ─── Commit: Security Higher-Order Component (HOC) ───
// What this does: Intercepts unauthorized users and kicks them back to the /login page.
// Interview insight: This is a classic "HOC pattern". It wraps around routes that require a session.
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Show spinner while we check the JWT token in the background
  if (loading) return <PageLoader />;

  // No user? Go back to login
  if (!user) return <Navigate to="/login" replace />;

  return <Layout>{children}</Layout>;
};

/* ================= APP ENTRY POINT ================= */
// ─── Commit: Global Routing & Provider Tree ───
// How it works: 
// 1. Router: Tracks the URL history.
// 2. AuthProvider: Manages the JWT session.
// 3. SocketProvider: Opens a WebSocket tunnel for real-time notifications.
// 4. Suspense: Handles lazy-loaded components.
const App = () => {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <Suspense fallback={<PageLoader />}>
            {/* Global toast notifications for success/error messages */}
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
              {/* Public Routes: Anyone can see these */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes: Only logged-in people can see these */}
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

              {/* Default Redirects: Handle "Not Found" or "Empty" URLs */}
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
