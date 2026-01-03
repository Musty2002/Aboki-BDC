import { useState, useEffect, forwardRef, useCallback } from "react";
import { Bell } from "lucide-react";
import { Branch, CityData } from "@/data/branchesData";
import CityCard from "@/components/rates/CityCard";
import BranchDetailSheet from "@/components/rates/BranchDetailSheet";
import RateAlertModal from "@/components/rates/RateAlertModal";
import { RateCardSkeleton } from "@/components/ui/LoadingSkeleton";
import { useRateAlerts } from "@/hooks/useRateAlerts";
import { supabase } from "@/integrations/supabase/client";

interface BDCRatesScreenProps {
  onRefresh?: () => Promise<void>;
}

const BDCRatesScreen = forwardRef<HTMLDivElement, BDCRatesScreenProps>(
  ({ onRefresh }, ref) => {
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<CityData[]>([]);
    const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
    const [showBranchDetail, setShowBranchDetail] = useState(false);
    const [showRateAlert, setShowRateAlert] = useState(false);

    const { alerts } = useRateAlerts();

    const fetchBranches = useCallback(async () => {
      try {
        // Define major cities priority (lower = higher priority)
        const cityPriority: Record<string, number> = {
          'ABUJA': 1,
          'LAGOS': 2,
          'PORT HARCOURT': 3,
          'KANO': 4,
          'IBADAN': 5,
        };

        // Fetch cities with their branches and rates
        const { data: cities, error: citiesError } = await supabase
          .from('cities')
          .select('id, name')
          .eq('is_active', true);

        if (citiesError) throw citiesError;

        const { data: branches, error: branchesError } = await supabase
          .from('branches')
          .select(`
            id,
            name,
            address,
            city_id,
            whatsapp_number,
            operating_hours,
            rating,
            review_count
          `)
          .eq('is_active', true);

        if (branchesError) throw branchesError;

        const { data: rates, error: ratesError } = await supabase
          .from('branch_rates')
          .select(`
            branch_id,
            currency_id,
            denomination,
            buy_rate,
            sell_rate,
            currencies (code, name, flag_url)
          `);

        if (ratesError) throw ratesError;

        const { data: currencies, error: currenciesError } = await supabase
          .from('currencies')
          .select('id, code, name, flag_url')
          .eq('is_active', true);

        if (currenciesError) throw currenciesError;

        // Sort cities by priority (major cities first, then alphabetically)
        const sortedCities = [...(cities || [])].sort((a, b) => {
          const priorityA = cityPriority[a.name.toUpperCase()] || 999;
          const priorityB = cityPriority[b.name.toUpperCase()] || 999;
          if (priorityA !== priorityB) return priorityA - priorityB;
          return a.name.localeCompare(b.name);
        });

        // Transform data to match CityData format
        const cityData: CityData[] = sortedCities.map(city => {
          const cityBranches = (branches || []).filter(b => b.city_id === city.id);
          
          return {
            city: city.name.toUpperCase(),
            branches: cityBranches.map(branch => {
              const branchRates = (rates || []).filter(r => r.branch_id === branch.id);
              
              return {
                id: branch.id,
                name: branch.name,
                address: branch.address,
                city: city.name.toUpperCase(),
                whatsappNumber: branch.whatsapp_number || '',
                operatingHours: branch.operating_hours,
                rating: branch.rating,
                reviewCount: branch.review_count,
                currencies: branchRates.map(rate => ({
                  code: (rate.currencies as any)?.code || '',
                  flag: (rate.currencies as any)?.flag_url || '',
                  buyRate: rate.buy_rate,
                  sellRate: rate.sell_rate,
                  denomination: rate.denomination || undefined,
                })),
              };
            }),
          };
        }).filter(city => city.branches.length > 0);

        setData(cityData);
      } catch (error) {
        console.error('Error fetching branches:', error);
      } finally {
        setIsLoading(false);
      }
    }, []);

    useEffect(() => {
      fetchBranches();
    }, [fetchBranches]);

    const handleBranchSelect = (branch: Branch) => {
      setSelectedBranch(branch);
      setShowBranchDetail(true);
    };

    if (isLoading) {
      return (
        <div className="flex flex-col gap-4 p-4 pb-8">
          {[1, 2, 3, 4].map((i) => (
            <RateCardSkeleton key={i} />
          ))}
        </div>
      );
    }

    return (
      <>
        <div ref={ref} className="flex flex-col gap-4 p-4 pb-8">
          {/* Alerts Badge */}
          {alerts.length > 0 && (
            <button
              onClick={() => setShowRateAlert(true)}
              className="flex items-center justify-between p-3 bg-primary/10 rounded-xl border border-primary/20"
            >
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  You have {alerts.length} active rate {alerts.length === 1 ? "alert" : "alerts"}
                </span>
              </div>
              <span className="text-xs text-primary/70">Manage →</span>
            </button>
          )}

          {/* City Cards */}
          {data.map((cityData) => (
            <CityCard
              key={cityData.city}
              cityData={cityData}
              onBranchSelect={handleBranchSelect}
            />
          ))}
        </div>

        {/* Branch Detail Sheet */}
        <BranchDetailSheet
          branch={selectedBranch}
          open={showBranchDetail}
          onOpenChange={setShowBranchDetail}
        />

        {/* Global Rate Alert Modal */}
        <RateAlertModal
          open={showRateAlert}
          onOpenChange={setShowRateAlert}
        />
      </>
    );
  }
);

BDCRatesScreen.displayName = "BDCRatesScreen";

export default BDCRatesScreen;
