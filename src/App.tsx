/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { LandingPage } from "@/features/landing/LandingPage";
import { AdminDashboard } from "@/features/admin/AdminDashboard";
import { StorePage } from "@/features/customer/StorePage";
import { RepairStatus } from "@/features/customer/RepairStatus";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // For this app, only the bootstrapped admin can access /admin
  const isAdmin = user?.email === "mhmd.smaiil2@gmail.com";
  
  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
          <Routes>
            {/* Admin routes protected */}
            <Route path="/admin/*" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            {/* Public routes */}
            <Route
              path="*"
              element={
                <>
                  <Navbar />
                  <main>
                    <Routes>
                      <Route path="/" element={<LandingPage />} />
                      <Route path="/store" element={<StorePage />} />
                      <Route path="/repair-status" element={<RepairStatus />} />
                    </Routes>
                  </main>
                </>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}
