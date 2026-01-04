import { useEffect, useState } from 'react';
import { Save, Building2, Clock, Phone, MapPin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface Branch {
  id: string;
  name: string;
  address: string;
  operating_hours: string;
  whatsapp_number: string | null;
  rating: number;
  review_count: number;
  is_active: boolean;
  city: { id: string; name: string };
}

interface Currency {
  id: string;
  code: string;
  name: string;
  flag_url: string;
}

interface BranchRate {
  id: string;
  currency_id: string;
  buy_rate: number;
  sell_rate: number;
  denomination: string | null;
  updated_at: string;
}

export default function AdminMyBranch() {
  const { assignedBranchIds, isLoading: authLoading } = useAdminAuth();
  const [branch, setBranch] = useState<Branch | null>(null);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [rates, setRates] = useState<BranchRate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Form state for rates
  const [rateInputs, setRateInputs] = useState<Record<string, { buy: string; sell: string }>>({});

  useEffect(() => {
    if (!authLoading && assignedBranchIds.length > 0) {
      fetchBranchData();
    } else if (!authLoading && assignedBranchIds.length === 0) {
      setIsLoading(false);
    }
  }, [authLoading, assignedBranchIds]);

  async function fetchBranchData() {
    const branchId = assignedBranchIds[0]; // Get first assigned branch
    
    try {
      const [branchRes, currenciesRes, ratesRes] = await Promise.all([
        supabase
          .from('branches')
          .select('*, city:cities(id, name)')
          .eq('id', branchId)
          .single(),
        supabase
          .from('currencies')
          .select('*')
          .eq('is_active', true)
          .order('code'),
        supabase
          .from('branch_rates')
          .select('*')
          .eq('branch_id', branchId),
      ]);

      if (branchRes.data) {
        setBranch(branchRes.data as unknown as Branch);
      }
      if (currenciesRes.data) {
        setCurrencies(currenciesRes.data);
      }
      if (ratesRes.data) {
        setRates(ratesRes.data);
        // Initialize rate inputs
        const inputs: Record<string, { buy: string; sell: string }> = {};
        ratesRes.data.forEach((rate) => {
          inputs[rate.currency_id] = {
            buy: rate.buy_rate.toString(),
            sell: rate.sell_rate.toString(),
          };
        });
        setRateInputs(inputs);
      }
    } catch (error) {
      console.error('Error fetching branch data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load branch data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveRates() {
    if (!branch) return;
    
    setIsSaving(true);
    
    try {
      const updates = Object.entries(rateInputs).map(([currencyId, values]) => {
        const existingRate = rates.find((r) => r.currency_id === currencyId);
        return {
          id: existingRate?.id,
          branch_id: branch.id,
          currency_id: currencyId,
          buy_rate: parseFloat(values.buy) || 0,
          sell_rate: parseFloat(values.sell) || 0,
        };
      });

      // Upsert rates
      for (const update of updates) {
        if (update.id) {
          await supabase
            .from('branch_rates')
            .update({
              buy_rate: update.buy_rate,
              sell_rate: update.sell_rate,
              updated_at: new Date().toISOString(),
            })
            .eq('id', update.id);
        } else {
          await supabase.from('branch_rates').insert({
            branch_id: update.branch_id,
            currency_id: update.currency_id,
            buy_rate: update.buy_rate,
            sell_rate: update.sell_rate,
          });
        }
      }

      toast({
        title: 'Success',
        description: 'Rates updated successfully',
      });
      
      // Refresh rates
      fetchBranchData();
    } catch (error) {
      console.error('Error saving rates:', error);
      toast({
        title: 'Error',
        description: 'Failed to save rates',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }

  function handleRateChange(currencyId: string, type: 'buy' | 'sell', value: string) {
    setRateInputs((prev) => ({
      ...prev,
      [currencyId]: {
        ...prev[currencyId],
        [type]: value,
      },
    }));
  }

  if (isLoading || authLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (assignedBranchIds.length === 0 || !branch) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Building2 className="h-16 w-16 text-slate-400 mb-4" />
        <h2 className="text-xl font-semibold text-slate-900">No Branch Assigned</h2>
        <p className="text-slate-500 mt-2 max-w-md">
          You don't have any branch assigned to your account. Please contact a super admin to assign you to a branch.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Branch</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your branch information and exchange rates
        </p>
      </div>

      {/* Branch Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-red-600" />
            {branch.name}
          </CardTitle>
          <CardDescription>{branch.city?.name}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-700">Address</p>
                <p className="text-sm text-slate-500">{branch.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-700">Operating Hours</p>
                <p className="text-sm text-slate-500">{branch.operating_hours}</p>
              </div>
            </div>
            {branch.whatsapp_number && (
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-700">WhatsApp</p>
                  <p className="text-sm text-slate-500">{branch.whatsapp_number}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <Star className="h-5 w-5 text-amber-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-700">Rating</p>
                <p className="text-sm text-slate-500">
                  {branch.rating.toFixed(1)} ({branch.review_count} reviews)
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exchange Rates Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Exchange Rates</CardTitle>
              <CardDescription>Update your branch's buy and sell rates</CardDescription>
            </div>
            <Button onClick={handleSaveRates} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Rates'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currencies.map((currency) => {
              const currentRate = rateInputs[currency.id] || { buy: '', sell: '' };
              const existingRate = rates.find((r) => r.currency_id === currency.id);
              
              return (
                <div key={currency.id} className="p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <img 
                      src={currency.flag_url} 
                      alt={currency.code}
                      className="h-6 w-8 object-cover rounded"
                    />
                    <div>
                      <p className="font-medium text-slate-900">{currency.code}</p>
                      <p className="text-xs text-slate-500">{currency.name}</p>
                    </div>
                    {existingRate && (
                      <span className="text-xs text-slate-400 ml-auto">
                        Last updated: {new Date(existingRate.updated_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`buy-${currency.id}`} className="text-slate-700">
                        Buy Rate (NGN)
                      </Label>
                      <Input
                        id={`buy-${currency.id}`}
                        type="number"
                        step="0.01"
                        value={currentRate.buy}
                        onChange={(e) => handleRateChange(currency.id, 'buy', e.target.value)}
                        placeholder="0.00"
                        className="mt-1 bg-white border-slate-300"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`sell-${currency.id}`} className="text-slate-700">
                        Sell Rate (NGN)
                      </Label>
                      <Input
                        id={`sell-${currency.id}`}
                        type="number"
                        step="0.01"
                        value={currentRate.sell}
                        onChange={(e) => handleRateChange(currency.id, 'sell', e.target.value)}
                        placeholder="0.00"
                        className="mt-1 bg-white border-slate-300"
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {currencies.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                No currencies available. Contact a super admin to add currencies.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
