import { useEffect, useState } from 'react';
import { Save, Loader2, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface Branch {
  id: string;
  name: string;
  city: { name: string };
}

interface Currency {
  id: string;
  code: string;
  flag_url: string;
}

interface Rate {
  id: string;
  branch_id: string;
  currency_id: string;
  denomination: string | null;
  buy_rate: number;
  sell_rate: number;
}

interface EditedRate {
  buy_rate: string;
  sell_rate: string;
}

export default function AdminRates() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [rates, setRates] = useState<Rate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('all');
  const [editedRates, setEditedRates] = useState<Record<string, EditedRate>>({});
  const { toast } = useToast();
  const { user } = useAdminAuth();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [branchesRes, currenciesRes, ratesRes] = await Promise.all([
        supabase
          .from('branches')
          .select('id, name, city:cities(name)')
          .eq('is_active', true)
          .order('name'),
        supabase.from('currencies').select('id, code, flag_url').eq('is_active', true).order('code'),
        supabase.from('branch_rates').select('*'),
      ]);

      if (branchesRes.data) setBranches(branchesRes.data as unknown as Branch[]);
      if (currenciesRes.data) setCurrencies(currenciesRes.data);
      if (ratesRes.data) setRates(ratesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function getRate(branchId: string, currencyId: string): Rate | undefined {
    return rates.find(r => r.branch_id === branchId && r.currency_id === currencyId);
  }

  function handleRateChange(rateId: string, field: 'buy_rate' | 'sell_rate', value: string) {
    setEditedRates(prev => ({
      ...prev,
      [rateId]: {
        ...prev[rateId],
        [field]: value,
      },
    }));
  }

  function hasChanges(): boolean {
    return Object.keys(editedRates).length > 0;
  }

  async function saveChanges() {
    if (!hasChanges()) return;

    setIsSaving(true);

    try {
      const updates = Object.entries(editedRates).map(([rateId, values]) => ({
        id: rateId,
        buy_rate: parseFloat(values.buy_rate),
        sell_rate: parseFloat(values.sell_rate),
        updated_by: user?.id,
        updated_at: new Date().toISOString(),
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('branch_rates')
          .update({
            buy_rate: update.buy_rate,
            sell_rate: update.sell_rate,
            updated_by: update.updated_by,
          })
          .eq('id', update.id);

        if (error) throw error;
      }

      // Update local state
      setRates(prev =>
        prev.map(rate => {
          const edited = editedRates[rate.id];
          if (edited) {
            return {
              ...rate,
              buy_rate: parseFloat(edited.buy_rate),
              sell_rate: parseFloat(edited.sell_rate),
            };
          }
          return rate;
        })
      );

      setEditedRates({});

      toast({
        title: 'Success',
        description: `Updated ${updates.length} rate(s)`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save changes',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }

  const filteredCurrencies = selectedCurrency === 'all'
    ? currencies
    : currencies.filter(c => c.id === selectedCurrency);

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
          <h1 className="text-2xl font-bold text-slate-900">Quick Rates Update</h1>
          <p className="text-sm text-slate-500 mt-1">
            Update exchange rates across all branches
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All currencies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All currencies</SelectItem>
              {currencies.map(c => (
                <SelectItem key={c.id} value={c.id}>
                  {c.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={saveChanges} disabled={!hasChanges() || isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Rates Grid */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {branches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-card-foreground">No branches found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Add branches first to manage rates
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 bg-card">Branch</TableHead>
                  {filteredCurrencies.map(currency => (
                    <TableHead key={currency.id} className="text-center min-w-[180px]">
                      <div className="flex items-center justify-center gap-2">
                        <img
                          src={currency.flag_url}
                          alt={currency.code}
                          className="h-4 w-6 object-cover rounded"
                        />
                        {currency.code}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {branches.map(branch => (
                  <TableRow key={branch.id}>
                    <TableCell className="sticky left-0 bg-card font-medium">
                      <div>
                        <p>{branch.name}</p>
                        <p className="text-xs text-muted-foreground">{branch.city?.name}</p>
                      </div>
                    </TableCell>
                    {filteredCurrencies.map(currency => {
                      const rate = getRate(branch.id, currency.id);
                      if (!rate) {
                        return (
                          <TableCell key={currency.id} className="text-center text-muted-foreground">
                            -
                          </TableCell>
                        );
                      }

                      const edited = editedRates[rate.id];
                      const buyValue = edited?.buy_rate ?? rate.buy_rate.toString();
                      const sellValue = edited?.sell_rate ?? rate.sell_rate.toString();

                      return (
                        <TableCell key={currency.id}>
                          <div className="flex gap-2">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Buy</p>
                              <Input
                                type="number"
                                step="0.01"
                                value={buyValue}
                                onChange={(e) => handleRateChange(rate.id, 'buy_rate', e.target.value)}
                                className="w-20 h-8 text-sm"
                              />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Sell</p>
                              <Input
                                type="number"
                                step="0.01"
                                value={sellValue}
                                onChange={(e) => handleRateChange(rate.id, 'sell_rate', e.target.value)}
                                className="w-20 h-8 text-sm"
                              />
                            </div>
                          </div>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {hasChanges() && (
        <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg">
          You have unsaved changes
        </div>
      )}
    </div>
  );
}
