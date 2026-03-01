import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AccountDetails from "./pages/AccountDetails";
import Transfer from "./pages/Transfer";
import Navbar from "./components/Navbar";
import "./index.css";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 pt-20">{children}</div>
    </>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-indigo-500/30">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Navigate to="/dashboard" />} />

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
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;
