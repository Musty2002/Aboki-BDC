import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Coins } from 'lucide-react';
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

interface Currency {
  id: string;
  code: string;
  name: string;
  flag_url: string;
  is_active: boolean;
}

export default function AdminCurrencies() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    flag_url: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchCurrencies();
  }, []);

  async function fetchCurrencies() {
    try {
      const { data, error } = await supabase
        .from('currencies')
        .select('*')
        .order('code');

      if (error) throw error;
      setCurrencies(data || []);
    } catch (error) {
      console.error('Error fetching currencies:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleCodeChange(code: string) {
    const upperCode = code.toUpperCase().slice(0, 3);
    setFormData(prev => ({ ...prev, code: upperCode }));
    
    // Auto-generate flag URL based on country code
    if (upperCode.length >= 2) {
      const countryCode = getCountryCode(upperCode);
      if (countryCode) {
        setFormData(prev => ({
          ...prev,
          flag_url: `https://flagcdn.com/w40/${countryCode}.png`,
        }));
      }
    }
  }

  function getCountryCode(currencyCode: string): string | null {
    const mapping: Record<string, string> = {
      'USD': 'us',
      'EUR': 'eu',
      'GBP': 'gb',
      'CAD': 'ca',
      'AED': 'ae',
      'CHF': 'ch',
      'CNY': 'cn',
      'SAR': 'sa',
      'AUD': 'au',
      'JPY': 'jp',
      'INR': 'in',
      'ZAR': 'za',
      'GHS': 'gh',
      'KES': 'ke',
      'NGN': 'ng',
      'XOF': 'sn',
      'EGP': 'eg',
      'MAD': 'ma',
      'TZS': 'tz',
      'UGX': 'ug',
    };
    return mapping[currencyCode] || currencyCode.slice(0, 2).toLowerCase();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!formData.code.trim() || !formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingCurrency) {
        const { error } = await supabase
          .from('currencies')
          .update({
            code: formData.code,
            name: formData.name,
            flag_url: formData.flag_url || `https://flagcdn.com/w40/${getCountryCode(formData.code)}.png`,
          })
          .eq('id', editingCurrency.id);

        if (error) throw error;

        setCurrencies(prev =>
          prev.map(c =>
            c.id === editingCurrency.id
              ? { ...c, ...formData }
              : c
          ).sort((a, b) => a.code.localeCompare(b.code))
        );

        toast({ title: 'Success', description: 'Currency updated successfully' });
      } else {
        const { data, error } = await supabase
          .from('currencies')
          .insert({
            code: formData.code,
            name: formData.name,
            flag_url: formData.flag_url || `https://flagcdn.com/w40/${getCountryCode(formData.code)}.png`,
          })
          .select()
          .single();

        if (error) throw error;

        setCurrencies(prev => [...prev, data].sort((a, b) => a.code.localeCompare(b.code)));
        toast({ title: 'Success', description: 'Currency created successfully' });
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save currency',
        variant: 'destructive',
      });
    }
  }

  async function toggleCurrencyStatus(currency: Currency) {
    const { error } = await supabase
      .from('currencies')
      .update({ is_active: !currency.is_active })
      .eq('id', currency.id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update currency status',
        variant: 'destructive',
      });
      return;
    }

    setCurrencies(prev =>
      prev.map(c =>
        c.id === currency.id ? { ...c, is_active: !currency.is_active } : c
      )
    );

    toast({
      title: 'Success',
      description: `Currency ${!currency.is_active ? 'activated' : 'deactivated'}`,
    });
  }

  async function deleteCurrency(currency: Currency) {
    if (!confirm('Are you sure you want to delete this currency? This will remove it from all branches.')) {
      return;
    }

    const { error } = await supabase
      .from('currencies')
      .delete()
      .eq('id', currency.id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete currency',
        variant: 'destructive',
      });
      return;
    }

    setCurrencies(prev => prev.filter(c => c.id !== currency.id));
    toast({ title: 'Success', description: 'Currency deleted successfully' });
  }

  function resetForm() {
    setFormData({ code: '', name: '', flag_url: '' });
    setEditingCurrency(null);
  }

  function openEditDialog(currency: Currency) {
    setEditingCurrency(currency);
    setFormData({
      code: currency.code,
      name: currency.name,
      flag_url: currency.flag_url,
    });
    setIsDialogOpen(true);
  }

  function openCreateDialog() {
    resetForm();
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
          <h1 className="text-2xl font-bold text-slate-900">Currencies</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage supported currencies and their flags
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Currency
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCurrency ? 'Edit Currency' : 'Add New Currency'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Currency Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  placeholder="e.g., USD"
                  maxLength={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Currency Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., US Dollar"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="flag_url">Flag URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="flag_url"
                    value={formData.flag_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, flag_url: e.target.value }))}
                    placeholder="https://flagcdn.com/w40/us.png"
                    className="flex-1"
                  />
                  {formData.flag_url && (
                    <img
                      src={formData.flag_url}
                      alt="Flag preview"
                      className="h-10 w-10 object-contain rounded border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Auto-generated from currency code. You can customize if needed.
                </p>
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
                  {editingCurrency ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {currencies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Coins className="h-12 w-12 text-slate-400 mb-4" />
            <h3 className="font-semibold text-slate-900">No currencies found</h3>
            <p className="text-sm text-slate-500 mt-1">
              Get started by adding your first currency
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-slate-700">Flag</TableHead>
                <TableHead className="text-slate-700">Code</TableHead>
                <TableHead className="text-slate-700">Name</TableHead>
                <TableHead className="text-slate-700">Status</TableHead>
                <TableHead className="w-24 text-slate-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currencies.map(currency => (
                <TableRow key={currency.id}>
                  <TableCell>
                    <img
                      src={currency.flag_url}
                      alt={currency.code}
                      className="h-6 w-8 object-cover rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://flagcdn.com/w40/xx.png';
                      }}
                    />
                  </TableCell>
                  <TableCell className="font-mono font-medium text-slate-900">{currency.code}</TableCell>
                  <TableCell className="text-slate-700">{currency.name}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={currency.is_active ? 'default' : 'secondary'}
                      className="cursor-pointer"
                      onClick={() => toggleCurrencyStatus(currency)}
                    >
                      {currency.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(currency)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteCurrency(currency)}
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
