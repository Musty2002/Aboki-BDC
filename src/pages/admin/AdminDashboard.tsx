import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, Coins, Users, Bell, Plus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/admin/StatsCard';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardStats {
  totalBranches: number;
  totalCities: number;
  totalCurrencies: number;
  totalSubscribers: number;
  recentNotifications: number;
}

export default function AdminDashboard() {
  const { isSuperAdmin, assignedBranchIds } = useAdminAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [
          { count: branchCount },
          { count: cityCount },
          { count: currencyCount },
          { count: subscriberCount },
          { count: notificationCount },
        ] = await Promise.all([
          supabase.from('branches').select('*', { count: 'exact', head: true }),
          supabase.from('cities').select('*', { count: 'exact', head: true }),
          supabase.from('currencies').select('*', { count: 'exact', head: true }),
          supabase.from('push_subscriptions').select('*', { count: 'exact', head: true }),
          supabase.from('notification_logs').select('*', { count: 'exact', head: true }),
        ]);

        setStats({
          totalBranches: branchCount || 0,
          totalCities: cityCount || 0,
          totalCurrencies: currencyCount || 0,
          totalSubscribers: subscriberCount || 0,
          recentNotifications: notificationCount || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            {isSuperAdmin 
              ? 'Overview of your BDC operations' 
              : `Managing ${assignedBranchIds.length} branch(es)`
            }
          </p>
        </div>
        {isSuperAdmin && (
          <Button asChild>
            <Link to="/admin/branches/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Branch
            </Link>
          </Button>
        )}
      </div>

      {/* Stats grid */}
      {isSuperAdmin && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Branches"
            value={stats.totalBranches}
            icon={Building2}
            description="Active BDC locations"
          />
          <StatsCard
            title="Cities"
            value={stats.totalCities}
            icon={MapPin}
            description="Operating locations"
          />
          <StatsCard
            title="Currencies"
            value={stats.totalCurrencies}
            icon={Coins}
            description="Supported currencies"
          />
          <StatsCard
            title="Subscribers"
            value={stats.totalSubscribers}
            icon={Users}
            description="Push notification subscribers"
          />
        </div>
      )}

      {/* Quick actions */}
      {isSuperAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link 
            to="/admin/rates"
            className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-card-foreground">Quick Rates Update</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Update exchange rates across all branches
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </Link>

          <Link 
            to="/admin/notifications"
            className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-card-foreground">Send Notification</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Broadcast to all app subscribers
                </p>
              </div>
              <Bell className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </Link>

          <Link 
            to="/admin/branch-admins"
            className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-card-foreground">Manage Admins</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Add or remove branch administrators
                </p>
              </div>
              <Users className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </Link>
        </div>
      )}

      {/* Branch admin view */}
      {!isSuperAdmin && (
        <div className="bg-card rounded-xl p-6 border border-border">
          <h2 className="font-semibold text-card-foreground mb-4">Your Assigned Branches</h2>
          <p className="text-muted-foreground">
            You have access to manage {assignedBranchIds.length} branch(es).
          </p>
          <Button asChild className="mt-4">
            <Link to="/admin/my-branch">
              Manage Rates
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
