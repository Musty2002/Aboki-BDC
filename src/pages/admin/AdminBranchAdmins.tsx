import { useEffect, useState } from 'react';
import { Plus, Trash2, Users, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { format } from 'date-fns';

interface Branch {
  id: string;
  name: string;
  city: { name: string };
}

interface BranchAdmin {
  id: string;
  user_id: string;
  branch_id: string;
  assigned_at: string;
  profile?: { email: string; full_name: string | null };
  branch?: { name: string; city: { name: string } };
}

export default function AdminBranchAdmins() {
  const [admins, setAdmins] = useState<BranchAdmin[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    password: '',
    branchId: '',
  });
  const { toast } = useToast();
  const { user } = useAdminAuth();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [adminsRes, branchesRes] = await Promise.all([
        supabase
          .from('branch_admins')
          .select(`
            id,
            user_id,
            branch_id,
            assigned_at,
            profile:profiles(email, full_name),
            branch:branches(name, city:cities(name))
          `)
          .order('assigned_at', { ascending: false }),
        supabase
          .from('branches')
          .select('id, name, city:cities(name)')
          .eq('is_active', true)
          .order('name'),
      ]);

      if (adminsRes.data) setAdmins(adminsRes.data as unknown as BranchAdmin[]);
      if (branchesRes.data) setBranches(branchesRes.data as unknown as Branch[]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.email || !formData.password || !formData.branchId) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsInviting(true);

    try {
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/admin/login`,
          data: {
            full_name: formData.fullName,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');

      // Add branch_admin role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: 'branch_admin',
        });

      if (roleError) throw roleError;

      // Assign to branch
      const { data: assignmentData, error: assignError } = await supabase
        .from('branch_admins')
        .insert({
          user_id: authData.user.id,
          branch_id: formData.branchId,
          assigned_by: user?.id,
        })
        .select(`
          id,
          user_id,
          branch_id,
          assigned_at,
          branch:branches(name, city:cities(name))
        `)
        .single();

      if (assignError) throw assignError;

      // Add to list with profile info
      const newAdmin: BranchAdmin = {
        ...assignmentData,
        profile: { email: formData.email, full_name: formData.fullName },
        branch: assignmentData.branch as unknown as { name: string; city: { name: string } },
      };

      setAdmins(prev => [newAdmin, ...prev]);

      toast({
        title: 'Success',
        description: 'Branch admin invited successfully',
      });

      setIsDialogOpen(false);
      setFormData({ email: '', fullName: '', password: '', branchId: '' });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to invite admin',
        variant: 'destructive',
      });
    } finally {
      setIsInviting(false);
    }
  }

  async function removeAdmin(admin: BranchAdmin) {
    if (!confirm('Are you sure you want to remove this branch admin?')) {
      return;
    }

    try {
      // Remove branch assignment
      const { error: assignError } = await supabase
        .from('branch_admins')
        .delete()
        .eq('id', admin.id);

      if (assignError) throw assignError;

      // Remove role
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', admin.user_id)
        .eq('role', 'branch_admin');

      if (roleError) throw roleError;

      setAdmins(prev => prev.filter(a => a.id !== admin.id));

      toast({
        title: 'Success',
        description: 'Branch admin removed',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove admin',
        variant: 'destructive',
      });
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Branch Admins</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage branch administrator accounts
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Admin
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Branch Admin</DialogTitle>
              <DialogDescription>
                Create an account for a branch administrator
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleInvite} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="admin@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Initial Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="••••••••"
                />
                <p className="text-xs text-muted-foreground">
                  The admin can change this after first login
                </p>
              </div>
              <div className="space-y-2">
                <Label>Assign to Branch *</Label>
                <Select
                  value={formData.branchId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, branchId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map(branch => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name} ({branch.city?.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isInviting}>
                  {isInviting ? 'Creating...' : 'Create Admin'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {admins.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-12 w-12 text-slate-400 mb-4" />
            <h3 className="font-semibold text-slate-900">No branch admins yet</h3>
            <p className="text-sm text-slate-500 mt-1">
              Invite branch admins to manage their locations
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-slate-700">Admin</TableHead>
                <TableHead className="text-slate-700">Assigned Branch</TableHead>
                <TableHead className="text-slate-700">Assigned Date</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map(admin => (
                <TableRow key={admin.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-slate-900">
                        {admin.profile?.full_name || 'Unknown'}
                      </p>
                      <p className="text-sm text-slate-500">
                        {admin.profile?.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-slate-900">{admin.branch?.name}</p>
                      <p className="text-sm text-slate-500">
                        {admin.branch?.city?.name}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    {format(new Date(admin.assigned_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAdmin(admin)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
