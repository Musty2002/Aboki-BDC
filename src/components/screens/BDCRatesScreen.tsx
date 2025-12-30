import { useState, useEffect, forwardRef } from "react";
import { Bell } from "lucide-react";
import { branchesData, Branch, CityData } from "@/data/branchesData";
import CityCard from "@/components/rates/CityCard";
import BranchDetailSheet from "@/components/rates/BranchDetailSheet";
import SearchFilter from "@/components/rates/SearchFilter";
import RateAlertModal from "@/components/rates/RateAlertModal";
import { RateCardSkeleton } from "@/components/ui/LoadingSkeleton";
import { useRateAlerts } from "@/hooks/useRateAlerts";

interface BDCRatesScreenProps {
  onRefresh?: () => Promise<void>;
}

const BDCRatesScreen = forwardRef<HTMLDivElement, BDCRatesScreenProps>(
  ({ onRefresh }, ref) => {
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<CityData[]>(branchesData);
    const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
    const [showBranchDetail, setShowBranchDetail] = useState(false);
    const [showRateAlert, setShowRateAlert] = useState(false);
    
    // Search and filter state
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>([]);

    const { alerts } = useRateAlerts();

    useEffect(() => {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }, []);

    // Filter cities and branches based on search and currency filters
    const filteredData = data
      .map((cityData) => {
        // Filter branches within the city
        const filteredBranches = cityData.branches.filter((branch) => {
          // Search filter
          const matchesSearch =
            searchQuery === "" ||
            cityData.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
            branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            branch.address.toLowerCase().includes(searchQuery.toLowerCase());

          // Currency filter
          const matchesCurrency =
            selectedCurrencies.length === 0 ||
            branch.currencies.some((c) => selectedCurrencies.includes(c.code));

          return matchesSearch && matchesCurrency;
        });

        return {
          ...cityData,
          branches: filteredBranches,
        };
      })
      .filter((cityData) => cityData.branches.length > 0);

    const handleBranchSelect = (branch: Branch) => {
      setSelectedBranch(branch);
      setShowBranchDetail(true);
    };

    const handleCurrencyToggle = (currency: string) => {
      setSelectedCurrencies((prev) =>
        prev.includes(currency)
          ? prev.filter((c) => c !== currency)
          : [...prev, currency]
      );
    };

    const handleClearFilters = () => {
      setSearchQuery("");
      setSelectedCurrencies([]);
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
          {/* Search and Filter */}
          <SearchFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCurrencies={selectedCurrencies}
            onCurrencyToggle={handleCurrencyToggle}
            onClearFilters={handleClearFilters}
          />

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
          {filteredData.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No branches found matching your search.</p>
              <button
                onClick={handleClearFilters}
                className="text-primary text-sm font-medium mt-2 hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            filteredData.map((cityData) => (
              <CityCard
                key={cityData.city}
                cityData={cityData}
                onBranchSelect={handleBranchSelect}
              />
            ))
          )}
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
