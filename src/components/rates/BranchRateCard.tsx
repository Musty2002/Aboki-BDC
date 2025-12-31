import { useState } from "react";
import { MapPin, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface Currency {
  code: string;
  flag: string;
  buyRate: number;
  sellRate: number;
  denomination?: string;
}

interface BranchRateCardProps {
  branchName: string;
  currencies: Currency[];
}

// Map currency codes to country codes for flag images
const getFlagCode = (currencyCode: string): string => {
  const map: Record<string, string> = {
    USD: "us",
    EUR: "eu",
    GBP: "gb",
    CAD: "ca",
    AED: "ae",
    ZAR: "za",
    CNY: "cn",
    CHF: "ch",
    AUD: "au",
    JPY: "jp",
    SAR: "sa",
    KWD: "kw",
    QAR: "qa",
    OMR: "om",
    BHD: "bh",
    EGP: "eg",
    NGN: "ng",
  };
  return map[currencyCode] || "un";
};

const BranchRateCard = ({ branchName, currencies }: BranchRateCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-card rounded-xl overflow-hidden shadow-lg ios-transition">
      {/* Card Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 touch-target"
      >
        <div className="flex items-center gap-3">
          {/* Location Pin */}
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <MapPin className="w-4 h-4 text-primary-foreground" />
          </div>
          
          {/* Branch Name */}
          <span className="text-card-foreground font-semibold text-sm tracking-wide uppercase">
            {branchName} RATES
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Currency Count Badge */}
          <span className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
            {currencies.length}
          </span>
          
          {/* Chevron */}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-primary" />
          ) : (
            <ChevronDown className="w-5 h-5 text-primary" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      <div
        className={cn(
          "overflow-hidden ios-transition",
          isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-4 pb-4">
          {/* Header Row */}
          <div className="flex items-center justify-between py-1.5 border-b border-border mb-1">
            <span className="text-xs font-medium text-muted-foreground">Currency</span>
            <div className="flex gap-6">
              <span className="text-xs font-medium text-muted-foreground w-16 text-right">Buy</span>
              <span className="text-xs font-medium text-muted-foreground w-16 text-right">Sell</span>
            </div>
          </div>

          {/* Currency Rows */}
          {currencies.map((currency, index) => (
            <div
              key={`${currency.code}-${currency.denomination || index}`}
              className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
            >
              <div className="flex items-center gap-2">
                <img 
                  src={`https://flagcdn.com/24x18/${getFlagCode(currency.code)}.png`}
                  alt={currency.code}
                  className="w-5 h-4 object-cover rounded-sm"
                />
                <div className="flex flex-col">
                  <span className="font-medium text-card-foreground text-xs">{currency.code}</span>
                  {currency.denomination && (
                    <span className="text-[9px] text-muted-foreground">
                      {currency.denomination}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-6">
                <span className="text-card-foreground font-semibold w-16 text-right text-xs">
                  ₦{currency.buyRate.toLocaleString()}
                </span>
                <span className="text-card-foreground font-semibold w-16 text-right text-xs">
                  ₦{currency.sellRate.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BranchRateCard;
