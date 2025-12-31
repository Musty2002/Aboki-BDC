import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { useAdminAuth } from '@/hooks/useAdminAuth';

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, role, signOut } = useAdminAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <AdminSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        role={role}
        currentPath={location.pathname}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader 
          user={user}
          role={role}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          onSignOut={signOut}
        />

        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
