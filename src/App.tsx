import { useState, useCallback } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import { AdminLayout } from "./components/admin/AdminLayout";
import { AdminProtectedRoute } from "./components/admin/AdminProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

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
            <Route path="/" element={<Index />} />
            
            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="branches" element={<AdminBranches />} />
              <Route path="branches/new" element={<AdminBranchForm />} />
              <Route path="branches/:id/edit" element={<AdminBranchForm />} />
              <Route path="cities" element={<AdminCities />} />
              <Route path="currencies" element={<AdminCurrencies />} />
              <Route path="rates" element={<AdminRates />} />
              <Route path="notifications" element={<AdminNotifications />} />
              <Route path="branch-admins" element={<AdminBranchAdmins />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
