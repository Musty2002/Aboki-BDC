import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Branch {
  id: string;
  name: string;
  address: string;
  city: { id: string; name: string };
  is_active: boolean;
  rating: number;
  review_count: number;
}

interface City {
  id: string;
  name: string;
}

export default function AdminBranches() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [branchesRes, citiesRes] = await Promise.all([
        supabase
          .from('branches')
          .select('id, name, address, is_active, rating, review_count, city:cities(id, name)')
          .order('name'),
        supabase.from('cities').select('id, name').order('name'),
      ]);

      if (branchesRes.data) {
        setBranches(branchesRes.data as unknown as Branch[]);
      }
      if (citiesRes.data) {
        setCities(citiesRes.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function toggleBranchStatus(branchId: string, currentStatus: boolean) {
    const { error } = await supabase
      .from('branches')
      .update({ is_active: !currentStatus })
      .eq('id', branchId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update branch status',
        variant: 'destructive',
      });
      return;
    }

    setBranches(prev =>
      prev.map(b =>
        b.id === branchId ? { ...b, is_active: !currentStatus } : b
      )
    );

    toast({
      title: 'Success',
      description: `Branch ${!currentStatus ? 'activated' : 'deactivated'}`,
    });
  }

  async function deleteBranch(branchId: string) {
    if (!confirm('Are you sure you want to delete this branch? This action cannot be undone.')) {
      return;
    }

    const { error } = await supabase
      .from('branches')
      .delete()
      .eq('id', branchId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete branch',
        variant: 'destructive',
      });
      return;
    }

    setBranches(prev => prev.filter(b => b.id !== branchId));
    toast({
      title: 'Success',
      description: 'Branch deleted successfully',
    });
  }

  const filteredBranches = branches.filter(branch => {
    const matchesSearch = branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = cityFilter === 'all' || branch.city?.id === cityFilter;
    return matchesSearch && matchesCity;
  });

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
          <h1 className="text-2xl font-bold text-slate-900">Branches</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage all BDC branch locations
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/branches/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Branch
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search branches..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={cityFilter} onValueChange={setCityFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All cities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All cities</SelectItem>
            {cities.map(city => (
              <SelectItem key={city.id} value={city.id}>
                {city.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {filteredBranches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-card-foreground">No branches found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery || cityFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Get started by adding your first branch'
              }
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Branch Name</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBranches.map(branch => (
                <TableRow key={branch.id}>
                  <TableCell className="font-medium">{branch.name}</TableCell>
                  <TableCell>{branch.city?.name || '-'}</TableCell>
                  <TableCell className="max-w-xs truncate">{branch.address}</TableCell>
                  <TableCell>
                    <span className="text-amber-500">★</span> {branch.rating.toFixed(1)}
                    <span className="text-muted-foreground text-xs ml-1">
                      ({branch.review_count})
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={branch.is_active ? 'default' : 'secondary'}>
                      {branch.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/admin/branches/${branch.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/admin/branches/${branch.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => toggleBranchStatus(branch.id, branch.is_active)}
                        >
                          {branch.is_active ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => deleteBranch(branch.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
