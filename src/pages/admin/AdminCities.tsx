import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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

interface City {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  branchCount?: number;
}

export default function AdminCities() {
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [cityName, setCityName] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchCities();
  }, []);

  async function fetchCities() {
    try {
      // Fetch cities
      const { data: citiesData, error: citiesError } = await supabase
        .from('cities')
        .select('*')
        .order('name');

      if (citiesError) throw citiesError;

      // Fetch branch counts for each city
      const { data: branchCounts } = await supabase
        .from('branches')
        .select('city_id');

      const countMap: Record<string, number> = {};
      branchCounts?.forEach(b => {
        countMap[b.city_id] = (countMap[b.city_id] || 0) + 1;
      });

      const citiesWithCounts = citiesData?.map(city => ({
        ...city,
        branchCount: countMap[city.id] || 0,
      })) || [];

      setCities(citiesWithCounts);
    } catch (error) {
      console.error('Error fetching cities:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!cityName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a city name',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingCity) {
        // Update existing city
        const { error } = await supabase
          .from('cities')
          .update({ name: cityName.trim() })
          .eq('id', editingCity.id);

        if (error) throw error;

        setCities(prev =>
          prev.map(c =>
            c.id === editingCity.id ? { ...c, name: cityName.trim() } : c
          )
        );

        toast({ title: 'Success', description: 'City updated successfully' });
      } else {
        // Create new city
        const { data, error } = await supabase
          .from('cities')
          .insert({ name: cityName.trim() })
          .select()
          .single();

        if (error) throw error;

        setCities(prev => [...prev, { ...data, branchCount: 0 }].sort((a, b) => a.name.localeCompare(b.name)));
        toast({ title: 'Success', description: 'City created successfully' });
      }

      setIsDialogOpen(false);
      setCityName('');
      setEditingCity(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save city',
        variant: 'destructive',
      });
    }
  }

  async function toggleCityStatus(city: City) {
    const { error } = await supabase
      .from('cities')
      .update({ is_active: !city.is_active })
      .eq('id', city.id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update city status',
        variant: 'destructive',
      });
      return;
    }

    setCities(prev =>
      prev.map(c =>
        c.id === city.id ? { ...c, is_active: !city.is_active } : c
      )
    );

    toast({
      title: 'Success',
      description: `City ${!city.is_active ? 'activated' : 'deactivated'}`,
    });
  }

  async function deleteCity(city: City) {
    if (city.branchCount && city.branchCount > 0) {
      toast({
        title: 'Cannot delete',
        description: 'Remove all branches from this city first',
        variant: 'destructive',
      });
      return;
    }

    if (!confirm('Are you sure you want to delete this city?')) {
      return;
    }

    const { error } = await supabase
      .from('cities')
      .delete()
      .eq('id', city.id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete city',
        variant: 'destructive',
      });
      return;
    }

    setCities(prev => prev.filter(c => c.id !== city.id));
    toast({ title: 'Success', description: 'City deleted successfully' });
  }

  function openEditDialog(city: City) {
    setEditingCity(city);
    setCityName(city.name);
    setIsDialogOpen(true);
  }

  function openCreateDialog() {
    setEditingCity(null);
    setCityName('');
    setIsDialogOpen(true);
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
          <h1 className="text-2xl font-bold text-slate-900">Cities</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage operating locations
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add City
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCity ? 'Edit City' : 'Add New City'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">City Name</Label>
                <Input
                  id="name"
                  value={cityName}
                  onChange={(e) => setCityName(e.target.value)}
                  placeholder="e.g., Lagos"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingCity ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {cities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-card-foreground">No cities found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Get started by adding your first city
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>City Name</TableHead>
                <TableHead>Branches</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cities.map(city => (
                <TableRow key={city.id}>
                  <TableCell className="font-medium">{city.name}</TableCell>
                  <TableCell>{city.branchCount} branches</TableCell>
                  <TableCell>
                    <Badge 
                      variant={city.is_active ? 'default' : 'secondary'}
                      className="cursor-pointer"
                      onClick={() => toggleCityStatus(city)}
                    >
                      {city.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(city)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteCity(city)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
