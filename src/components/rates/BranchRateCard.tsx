import { useState } from "react";
import { MapPin, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface Currency {
  code: string;
  flag: string;
  buyRate: number;
  sellRate: number;
}

interface BranchRateCardProps {
  branchName: string;
  currencies: Currency[];
}

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
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5 text-primary-foreground" />
          </div>
          
          {/* Branch Name */}
          <span className="text-card-foreground font-semibold text-lg tracking-wide uppercase">
            {branchName} RATES
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Currency Count Badge */}
          <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
            {currencies.length}
          </span>
          
          {/* Chevron */}
          {isExpanded ? (
            <ChevronUp className="w-6 h-6 text-primary" />
          ) : (
            <ChevronDown className="w-6 h-6 text-primary" />
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
          <div className="flex items-center justify-between py-2 border-b border-border mb-2">
            <span className="text-sm font-medium text-muted-foreground">Currency</span>
            <div className="flex gap-8">
              <span className="text-sm font-medium text-muted-foreground w-20 text-right">Buy</span>
              <span className="text-sm font-medium text-muted-foreground w-20 text-right">Sell</span>
            </div>
          </div>

          {/* Currency Rows */}
          {currencies.map((currency) => (
            <div
              key={currency.code}
              className="flex items-center justify-between py-3 border-b border-border/50 last:border-0"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{currency.flag}</span>
                <span className="font-medium text-card-foreground">{currency.code}</span>
              </div>
              <div className="flex gap-8">
                <span className="text-card-foreground font-semibold w-20 text-right">
                  ₦{currency.buyRate.toLocaleString()}
                </span>
                <span className="text-card-foreground font-semibold w-20 text-right">
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
