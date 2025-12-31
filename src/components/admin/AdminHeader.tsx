import { User } from '@supabase/supabase-js';
import { Menu, LogOut, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AdminRole } from '@/hooks/useAdminAuth';

interface AdminHeaderProps {
  user: User | null;
  role: AdminRole | null;
  onMenuClick: () => void;
  onSignOut: () => void;
}

export function AdminHeader({ user, role, onMenuClick, onSignOut }: AdminHeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6">
      <Button 
        variant="ghost" 
        size="icon"
        onClick={onMenuClick}
        className="lg:hidden"
      >
        <Menu className="h-5 w-5 text-slate-600" />
      </Button>

      <div className="hidden lg:block">
        <h1 className="text-lg font-semibold text-slate-900">
          Aboki Admin Dashboard
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-red-50 flex items-center justify-center">
                <UserIcon className="h-4 w-4 text-red-600" />
              </div>
              <span className="hidden md:block text-sm font-medium text-slate-700">
                {user?.email?.split('@')[0]}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{user?.email}</span>
                <span className="text-xs text-muted-foreground capitalize">
                  {role?.replace('_', ' ')}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onSignOut} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
