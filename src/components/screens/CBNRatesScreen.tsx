import { TrendingUp, TrendingDown } from "lucide-react";

const cbnRates = [
  { code: "USD", flag: "🇺🇸", name: "US Dollar", rate: 1550.00, change: 2.5 },
  { code: "EUR", flag: "🇪🇺", name: "Euro", rate: 1650.00, change: 1.2 },
  { code: "GBP", flag: "🇬🇧", name: "British Pound", rate: 1920.00, change: -0.8 },
  { code: "CAD", flag: "🇨🇦", name: "Canadian Dollar", rate: 1130.00, change: 0.5 },
  { code: "CHF", flag: "🇨🇭", name: "Swiss Franc", rate: 1750.00, change: 1.1 },
  { code: "AUD", flag: "🇦🇺", name: "Australian Dollar", rate: 1000.00, change: -0.3 },
  { code: "JPY", flag: "🇯🇵", name: "Japanese Yen", rate: 10.00, change: 0.2 },
  { code: "CNY", flag: "🇨🇳", name: "Chinese Yuan", rate: 210.00, change: 0.8 },
  { code: "ZAR", flag: "🇿🇦", name: "South African Rand", rate: 82.00, change: -1.5 },
  { code: "AED", flag: "🇦🇪", name: "UAE Dirham", rate: 420.00, change: 0.1 },
];

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

const CBNRatesScreen = () => {
  return (
    <div className="p-3 pb-6">
      {/* Header Card */}
      <div className="bg-card rounded-xl p-3 mb-3 shadow-lg">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-sm font-semibold text-card-foreground">
            CBN Official Rates
          </h2>
          <span className="text-[10px] text-muted-foreground">
            Updated: Today
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Central Bank of Nigeria official exchange rates
        </p>
      </div>

      {/* Rates List */}
      <div className="bg-card rounded-xl overflow-hidden shadow-lg">
        {/* Table Header */}
        <div className="flex items-center justify-between px-3 py-2 bg-secondary/10 border-b border-border">
          <span className="text-xs font-medium text-muted-foreground">Currency</span>
          <div className="flex gap-3">
            <span className="text-xs font-medium text-muted-foreground w-20 text-right">Rate (₦)</span>
            <span className="text-xs font-medium text-muted-foreground w-12 text-right">Change</span>
          </div>
        </div>

        {/* Currency Rows */}
        {cbnRates.map((currency, index) => (
          <div
            key={currency.code}
            className={`flex items-center justify-between px-3 py-2.5 ${
              index !== cbnRates.length - 1 ? "border-b border-border/50" : ""
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
                  {currency.name}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-card-foreground font-bold w-20 text-right text-xs">
                ₦{currency.rate.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              <div className={`flex items-center gap-0.5 w-12 justify-end ${
                currency.change >= 0 ? "text-green-600" : "text-red-500"
              }`}>
                {currency.change >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span className="text-[10px] font-medium">
                  {Math.abs(currency.change)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CBNRatesScreen;
