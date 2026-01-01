import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  MapPin, 
  Coins, 
  DollarSign, 
  Bell, 
  Users, 
  Settings,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AdminRole } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/button';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  role: AdminRole | null;
  currentPath: string;
}

const superAdminNavItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/branches', label: 'Branches', icon: Building2 },
  { path: '/admin/cities', label: 'Cities', icon: MapPin },
  { path: '/admin/currencies', label: 'Currencies', icon: Coins },
  { path: '/admin/rates', label: 'Quick Rates', icon: DollarSign },
  { path: '/admin/notifications', label: 'Notifications', icon: Bell },
  { path: '/admin/branch-admins', label: 'Branch Admins', icon: Users },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
];

const branchAdminNavItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/my-branch', label: 'My Branch', icon: Building2 },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminSidebar({ isOpen, onClose, role, currentPath }: AdminSidebarProps) {
  const navItems = role === 'super_admin' ? superAdminNavItems : branchAdminNavItems;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200">
            <Link to="/admin" className="flex items-center gap-2">
              <img 
                src="/favicon.jpg"
                alt="Aboki"
                className="h-8 w-auto"
              />
              <span className="font-semibold text-slate-900">Admin</span>
            </Link>
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = currentPath === item.path || 
                (item.path !== '/admin' && currentPath.startsWith(item.path));
              
              return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive 
                        ? "bg-red-600 text-white" 
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    )}
                  onClick={() => window.innerWidth < 1024 && onClose()}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Role badge */}
          <div className="p-4 border-t border-slate-200">
            <div className={cn(
              "px-3 py-2 rounded-lg text-xs font-medium text-center",
              role === 'super_admin' 
                ? "bg-red-50 text-red-600" 
                : "bg-blue-50 text-blue-600"
            )}>
              {role === 'super_admin' ? 'Super Admin' : 'Branch Admin'}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
