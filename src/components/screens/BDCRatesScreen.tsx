import { useState, useEffect, forwardRef } from "react";
import BranchRateCard from "@/components/rates/BranchRateCard";
import { RateCardSkeleton } from "@/components/ui/LoadingSkeleton";

// Sample data for 6 branches
const branchesData = [
  {
    name: "ABUJA",
    currencies: [
      { code: "USD", flag: "🇺🇸", buyRate: 1580, sellRate: 1620 },
      { code: "EUR", flag: "🇪🇺", buyRate: 1680, sellRate: 1720 },
      { code: "GBP", flag: "🇬🇧", buyRate: 1950, sellRate: 2000 },
      { code: "CAD", flag: "🇨🇦", buyRate: 1150, sellRate: 1180 },
      { code: "AED", flag: "🇦🇪", buyRate: 425, sellRate: 440 },
      { code: "ZAR", flag: "🇿🇦", buyRate: 85, sellRate: 92 },
      { code: "CNY", flag: "🇨🇳", buyRate: 215, sellRate: 225 },
      { code: "CHF", flag: "🇨🇭", buyRate: 1780, sellRate: 1830 },
      { code: "AUD", flag: "🇦🇺", buyRate: 1020, sellRate: 1060 },
      { code: "JPY", flag: "🇯🇵", buyRate: 10.2, sellRate: 10.8 },
      { code: "SAR", flag: "🇸🇦", buyRate: 415, sellRate: 430 },
      { code: "KWD", flag: "🇰🇼", buyRate: 5100, sellRate: 5250 },
      { code: "QAR", flag: "🇶🇦", buyRate: 425, sellRate: 440 },
      { code: "OMR", flag: "🇴🇲", buyRate: 4050, sellRate: 4180 },
      { code: "BHD", flag: "🇧🇭", buyRate: 4150, sellRate: 4280 },
      { code: "EGP", flag: "🇪🇬", buyRate: 32, sellRate: 35 },
    ],
  },
  {
    name: "LAGOS",
    currencies: [
      { code: "USD", flag: "🇺🇸", buyRate: 1575, sellRate: 1615 },
      { code: "EUR", flag: "🇪🇺", buyRate: 1675, sellRate: 1715 },
      { code: "GBP", flag: "🇬🇧", buyRate: 1945, sellRate: 1995 },
      { code: "CAD", flag: "🇨🇦", buyRate: 1145, sellRate: 1175 },
    ],
  },
  {
    name: "PORT HARCOURT",
    currencies: [
      { code: "USD", flag: "🇺🇸", buyRate: 1570, sellRate: 1610 },
      { code: "EUR", flag: "🇪🇺", buyRate: 1670, sellRate: 1710 },
      { code: "GBP", flag: "🇬🇧", buyRate: 1940, sellRate: 1990 },
      { code: "CAD", flag: "🇨🇦", buyRate: 1140, sellRate: 1170 },
    ],
  },
  {
    name: "KANO",
    currencies: [
      { code: "USD", flag: "🇺🇸", buyRate: 1585, sellRate: 1625 },
    ],
  },
  {
    name: "KADUNA",
    currencies: [
      { code: "USD", flag: "🇺🇸", buyRate: 1582, sellRate: 1622 },
    ],
  },
  {
    name: "BAUCHI",
    currencies: [
      { code: "USD", flag: "🇺🇸", buyRate: 1580, sellRate: 1620 },
    ],
  },
];

interface BDCRatesScreenProps {
  onRefresh?: () => Promise<void>;
}

const BDCRatesScreen = forwardRef<HTMLDivElement, BDCRatesScreenProps>(
  ({ onRefresh }, ref) => {
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState(branchesData);

    useEffect(() => {
      // Simulate initial load
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }, []);

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
      <div ref={ref} className="flex flex-col gap-4 p-4 pb-8">
        {data.map((branch) => (
          <BranchRateCard
            key={branch.name}
            branchName={branch.name}
            currencies={branch.currencies}
          />
        ))}
      </div>
    );
  }
);

BDCRatesScreen.displayName = "BDCRatesScreen";

export default BDCRatesScreen;
