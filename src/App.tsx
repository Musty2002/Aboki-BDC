import { useState, useCallback } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SplashScreen from "./components/SplashScreen";

// Admin pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBranches from "./pages/admin/AdminBranches";
import AdminBranchForm from "./pages/admin/AdminBranchForm";
import AdminCities from "./pages/admin/AdminCities";
import AdminCurrencies from "./pages/admin/AdminCurrencies";
import AdminRates from "./pages/admin/AdminRates";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminBranchAdmins from "./pages/admin/AdminBranchAdmins";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminSetup from "./pages/admin/AdminSetup";
import AdminMyBranch from "./pages/admin/AdminMyBranch";
import { AdminLayout } from "./components/admin/AdminLayout";
import { AdminProtectedRoute } from "./components/admin/AdminProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(() => {
    // Don't show splash on admin routes or admin subdomains
    const host = window.location.host.toLowerCase();
    const isAdminSubdomain =
      host === "setup.abokibdc.com.ng" || host === "admin.abokibdc.com.ng";

    return !isAdminSubdomain && !window.location.pathname.startsWith("/admin");
  });

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {showSplash && <SplashScreen onComplete={handleSplashComplete} duration={6000} />}
        <BrowserRouter>
          <Routes>
            {(() => {
              const host = window.location.host.toLowerCase();
              const isSetup = host === "setup.abokibdc.com.ng";
              const isAdmin = host === "admin.abokibdc.com.ng";

              const redirectForSubdomain = () => {
                const path = window.location.pathname;

                if (isSetup) return "/admin/setup";

                if (isAdmin) {
                  if (path === "/") return "/admin";
                  if (path.startsWith("/admin")) return path;
                  return `/admin${path}`;
                }

                return null;
              };

              const SubdomainGuard = ({ children }: { children: React.ReactNode }) => {
                const redirectTo = redirectForSubdomain();
                if (redirectTo) return <Navigate to={redirectTo} replace />;
                return <>{children}</>;
              };

              return (
                <>
                  {/* Public homepage (blocked on admin/setup subdomains) */}
                  <Route
                    path="/"
                    element={
                      <SubdomainGuard>
                        <Index />
                      </SubdomainGuard>
                    }
                  />

                  {/* Admin routes */}
                  <Route path="/admin/setup" element={<AdminSetup />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route
                    path="/admin"
                    element={
                      <AdminProtectedRoute>
                        <AdminLayout />
                      </AdminProtectedRoute>
                    }
                  >
                    <Route index element={<AdminDashboard />} />
                    <Route path="branches" element={<AdminBranches />} />
                    <Route path="branches/new" element={<AdminBranchForm />} />
                    <Route path="branches/:id/edit" element={<AdminBranchForm />} />
                    <Route path="cities" element={<AdminCities />} />
                    <Route path="currencies" element={<AdminCurrencies />} />
                    <Route path="rates" element={<AdminRates />} />
                    <Route path="notifications" element={<AdminNotifications />} />
                    <Route path="branch-admins" element={<AdminBranchAdmins />} />
                    <Route path="my-branch" element={<AdminMyBranch />} />
                    <Route path="settings" element={<AdminSettings />} />
                  </Route>

                  {/* Catch-all: on subdomains, always force into admin paths */}
                  <Route
                    path="*"
                    element={(() => {
                      const redirectTo = redirectForSubdomain();
                      if (redirectTo) return <Navigate to={redirectTo} replace />;
                      return <NotFound />;
                    })()}
                  />
                </>
              );
            })()}
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
