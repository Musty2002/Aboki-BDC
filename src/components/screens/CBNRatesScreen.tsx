import { useState, useEffect, forwardRef } from "react";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { CBNRateSkeleton } from "@/components/ui/LoadingSkeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface CurrencyRate {
  code: string;
  name: string;
  buyingRate: number;
  centralRate: number;
  sellingRate: number;
}

interface CBNRatesResponse {
  success: boolean;
  lastUpdated: string;
  currencies: CurrencyRate[];
  latestRate?: {
    date: string;
    nfemRate: number;
    highestRate: number;
    lowestRate: number;
    closingRate: number;
    averageRate: number;
  };
  error?: string;
}

// Map currency codes to country codes for flag images
const getFlagCode = (currencyCode: string): string => {
  const map: Record<string, string> = {
    USD: "us",
    EUR: "eu",
    GBP: "gb",
    CAD: "ca",
    CHF: "ch",
    AUD: "au",
    JPY: "jp",
    CNY: "cn",
    ZAR: "za",
    AED: "ae",
    NGN: "ng",
  };
  return map[currencyCode] || "un";
};

const currencyNames: Record<string, string> = {
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound",
  CAD: "Canadian Dollar",
  CHF: "Swiss Franc",
  AUD: "Australian Dollar",
  JPY: "Japanese Yen",
  CNY: "Chinese Yuan",
  ZAR: "South African Rand",
  AED: "UAE Dirham",
};

interface CBNRatesScreenProps {
  onRefresh?: () => Promise<void>;
}

const CBNRatesScreen = forwardRef<HTMLDivElement, CBNRatesScreenProps>(
  ({ onRefresh }, ref) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [rates, setRates] = useState<CurrencyRate[]>([]);
    const [lastUpdated, setLastUpdated] = useState<string>("");
    const [latestNFEM, setLatestNFEM] = useState<CBNRatesResponse["latestRate"]>();

    const fetchRates = async (showToast = false) => {
      try {
        if (showToast) setIsRefreshing(true);
        
        const { data, error } = await supabase.functions.invoke('fetch-cbn-rates');
        
        if (error) throw error;
        
        const response = data as CBNRatesResponse;
        
        if (response.currencies && response.currencies.length > 0) {
          setRates(response.currencies);
          setLastUpdated(response.lastUpdated || new Date().toISOString());
          setLatestNFEM(response.latestRate);
          
          if (showToast) {
            toast({
              title: "Rates Updated",
              description: "CBN rates refreshed successfully",
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch CBN rates:", error);
        if (showToast) {
          toast({
            title: "Error",
            description: "Failed to fetch rates. Using cached data.",
            variant: "destructive",
          });
        }
        // Use fallback data
        setRates([
          { code: "USD", name: "US Dollar", buyingRate: 1540, centralRate: 1550, sellingRate: 1560 },
          { code: "EUR", name: "Euro", buyingRate: 1670, centralRate: 1680, sellingRate: 1690 },
          { code: "GBP", name: "British Pound", buyingRate: 1960, centralRate: 1970, sellingRate: 1980 },
          { code: "CAD", name: "Canadian Dollar", buyingRate: 1130, centralRate: 1140, sellingRate: 1150 },
          { code: "CHF", name: "Swiss Franc", buyingRate: 1360, centralRate: 1370, sellingRate: 1380 },
          { code: "AUD", name: "Australian Dollar", buyingRate: 1000, centralRate: 1010, sellingRate: 1020 },
          { code: "JPY", name: "Japanese Yen", buyingRate: 10.2, centralRate: 10.4, sellingRate: 10.6 },
          { code: "CNY", name: "Chinese Yuan", buyingRate: 215, centralRate: 217, sellingRate: 219 },
          { code: "ZAR", name: "South African Rand", buyingRate: 84, centralRate: 85, sellingRate: 86 },
          { code: "AED", name: "UAE Dirham", buyingRate: 420, centralRate: 422, sellingRate: 424 },
        ]);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    };

    useEffect(() => {
      fetchRates();
    }, []);

    const handleRefresh = async () => {
      await fetchRates(true);
      if (onRefresh) await onRefresh();
    };

    const formatDate = (dateStr: string) => {
      if (!dateStr) return "Today";
      try {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-NG", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch {
        return "Today";
      }
    };

    if (isLoading) {
      return <CBNRateSkeleton />;
    }

    return (
      <div ref={ref} className="p-3 pb-6">
        {/* Header Card */}
        <div className="bg-card rounded-xl p-3 mb-3 shadow-lg">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-semibold text-card-foreground">
              CBN Official Rates
            </h2>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`} />
              {formatDate(lastUpdated)}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Central Bank of Nigeria official exchange rates
          </p>
          
          {/* NFEM Rate Highlight */}
          {latestNFEM && (
            <div className="mt-2 pt-2 border-t border-border/50">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">NFEM Rate (₦/US$)</span>
                <span className="text-sm font-bold text-primary">
                  ₦{latestNFEM.nfemRate.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1 text-[10px] text-muted-foreground">
                <span>Range: ₦{latestNFEM.lowestRate.toLocaleString()} - ₦{latestNFEM.highestRate.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Rates List */}
        <div className="bg-card rounded-xl overflow-hidden shadow-lg">
          {/* Table Header */}
          <div className="flex items-center justify-between px-3 py-2 bg-secondary/10 border-b border-border">
            <span className="text-xs font-medium text-muted-foreground">Currency</span>
            <div className="flex gap-2">
              <span className="text-xs font-medium text-muted-foreground w-16 text-right">Buy</span>
              <span className="text-xs font-medium text-muted-foreground w-16 text-right">Central</span>
              <span className="text-xs font-medium text-muted-foreground w-16 text-right">Sell</span>
            </div>
          </div>

          {/* Currency Rows */}
          {rates.map((currency, index) => (
            <div
              key={currency.code}
              className={`flex items-center justify-between px-3 py-2.5 ${
                index !== rates.length - 1 ? "border-b border-border/50" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <img 
                  src={`https://flagcdn.com/24x18/${getFlagCode(currency.code)}.png`}
                  alt={currency.code}
                  className="w-5 h-4 object-cover rounded-sm"
                />
                <div>
                  <span className="font-semibold text-card-foreground block text-xs">
                    {currency.code}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {currencyNames[currency.code] || currency.name}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-card-foreground font-medium w-16 text-right text-[10px]">
                  ₦{currency.buyingRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-primary font-bold w-16 text-right text-xs">
                  ₦{currency.centralRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-card-foreground font-medium w-16 text-right text-[10px]">
                  ₦{currency.sellingRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
);

CBNRatesScreen.displayName = "CBNRatesScreen";

export default CBNRatesScreen;
