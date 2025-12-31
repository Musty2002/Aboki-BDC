import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface City {
  id: string;
  name: string;
}

interface Currency {
  id: string;
  code: string;
  name: string;
  flag_url: string;
}

interface BranchRate {
  currency_id: string;
  denomination: string;
  buy_rate: string;
  sell_rate: string;
}

export default function AdminBranchForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAdminAuth();
  const isEditing = Boolean(id);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    cityId: '',
    whatsappNumber: '',
    operatingHours: '8:00 AM - 5:00 PM',
  });

  const [rates, setRates] = useState<BranchRate[]>([]);

  useEffect(() => {
    fetchData();
  }, [id]);

  async function fetchData() {
    try {
      const [citiesRes, currenciesRes] = await Promise.all([
        supabase.from('cities').select('id, name').eq('is_active', true).order('name'),
        supabase.from('currencies').select('id, code, name, flag_url').eq('is_active', true).order('code'),
      ]);

      if (citiesRes.data) setCities(citiesRes.data);
      if (currenciesRes.data) setCurrencies(currenciesRes.data);

      if (id) {
        // Fetch existing branch data
        const { data: branchData, error: branchError } = await supabase
          .from('branches')
          .select('*')
          .eq('id', id)
          .single();

        if (branchError) throw branchError;

        setFormData({
          name: branchData.name,
          address: branchData.address,
          cityId: branchData.city_id,
          whatsappNumber: branchData.whatsapp_number || '',
          operatingHours: branchData.operating_hours,
        });

        // Fetch branch rates
        const { data: ratesData } = await supabase
          .from('branch_rates')
          .select('*')
          .eq('branch_id', id);

        if (ratesData) {
          setRates(ratesData.map(r => ({
            currency_id: r.currency_id,
            denomination: r.denomination || '',
            buy_rate: r.buy_rate.toString(),
            sell_rate: r.sell_rate.toString(),
          })));
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  function addRate() {
    const availableCurrency = currencies.find(
      c => !rates.some(r => r.currency_id === c.id && !r.denomination)
    );
    
    if (!availableCurrency) {
      toast({
        title: 'No more currencies',
        description: 'All currencies have been added',
        variant: 'destructive',
      });
      return;
    }

    setRates(prev => [...prev, {
      currency_id: availableCurrency.id,
      denomination: '',
      buy_rate: '',
      sell_rate: '',
    }]);
  }

  function removeRate(index: number) {
    setRates(prev => prev.filter((_, i) => i !== index));
  }

  function updateRate(index: number, field: keyof BranchRate, value: string) {
    setRates(prev => prev.map((rate, i) => 
      i === index ? { ...rate, [field]: value } : rate
    ));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.name || !formData.address || !formData.cityId) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      const branchPayload = {
        name: formData.name,
        address: formData.address,
        city_id: formData.cityId,
        whatsapp_number: formData.whatsappNumber || null,
        operating_hours: formData.operatingHours,
      };

      let branchId = id;

      if (isEditing) {
        const { error } = await supabase
          .from('branches')
          .update(branchPayload)
          .eq('id', id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('branches')
          .insert(branchPayload)
          .select()
          .single();

        if (error) throw error;
        branchId = data.id;
      }

      // Handle rates
      if (branchId) {
        // Delete existing rates
        await supabase
          .from('branch_rates')
          .delete()
          .eq('branch_id', branchId);

        // Insert new rates
        const validRates = rates.filter(r => r.buy_rate && r.sell_rate);
        if (validRates.length > 0) {
          const { error: ratesError } = await supabase
            .from('branch_rates')
            .insert(
              validRates.map(r => ({
                branch_id: branchId,
                currency_id: r.currency_id,
                denomination: r.denomination || null,
                buy_rate: parseFloat(r.buy_rate),
                sell_rate: parseFloat(r.sell_rate),
                updated_by: user?.id,
              }))
            );

          if (ratesError) throw ratesError;
        }
      }

      toast({
        title: 'Success',
        description: `Branch ${isEditing ? 'updated' : 'created'} successfully`,
      });

      navigate('/admin/branches');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save branch',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/branches')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isEditing ? 'Edit Branch' : 'Add New Branch'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isEditing ? 'Update branch details and rates' : 'Create a new BDC location'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Branch Details */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="font-semibold text-card-foreground mb-4">Branch Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Branch Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Aboki Exchange - Victoria Island"
              />
            </div>
            <div className="space-y-2">
              <Label>City *</Label>
              <Select
                value={formData.cityId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, cityId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map(city => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Full address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp Number</Label>
              <Input
                id="whatsapp"
                value={formData.whatsappNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                placeholder="+234 xxx xxx xxxx"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hours">Operating Hours</Label>
              <Input
                id="hours"
                value={formData.operatingHours}
                onChange={(e) => setFormData(prev => ({ ...prev, operatingHours: e.target.value }))}
                placeholder="8:00 AM - 5:00 PM"
              />
            </div>
          </div>
        </div>

        {/* Currency Rates */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-card-foreground">Currency Rates</h2>
            <Button type="button" variant="outline" size="sm" onClick={addRate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Currency
            </Button>
          </div>

          {rates.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No currencies added yet. Click "Add Currency" to start.
            </p>
          ) : (
            <div className="space-y-4">
              {rates.map((rate, index) => {
                const currency = currencies.find(c => c.id === rate.currency_id);
                return (
                  <div key={index} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2 min-w-[140px]">
                      {currency && (
                        <img
                          src={currency.flag_url}
                          alt={currency.code}
                          className="h-5 w-7 object-cover rounded"
                        />
                      )}
                      <Select
                        value={rate.currency_id}
                        onValueChange={(value) => updateRate(index, 'currency_id', value)}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {currencies.map(c => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-xs">Denomination</Label>
                        <Input
                          value={rate.denomination}
                          onChange={(e) => updateRate(index, 'denomination', e.target.value)}
                          placeholder="e.g., $100 notes"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Buy Rate *</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={rate.buy_rate}
                          onChange={(e) => updateRate(index, 'buy_rate', e.target.value)}
                          placeholder="0.00"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Sell Rate *</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={rate.sell_rate}
                          onChange={(e) => updateRate(index, 'sell_rate', e.target.value)}
                          placeholder="0.00"
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRate(index)}
                      className="text-destructive hover:text-destructive mt-6"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/branches')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              isEditing ? 'Update Branch' : 'Create Branch'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
