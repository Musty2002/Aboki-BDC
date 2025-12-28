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

const CBNRatesScreen = () => {
  return (
    <div className="p-4 pb-8">
      {/* Header Card */}
      <div className="bg-card rounded-xl p-4 mb-4 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-card-foreground">
            CBN Official Rates
          </h2>
          <span className="text-xs text-muted-foreground">
            Updated: Today
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          Central Bank of Nigeria official exchange rates
        </p>
      </div>

      {/* Rates List */}
      <div className="bg-card rounded-xl overflow-hidden shadow-lg">
        {/* Table Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-secondary/10 border-b border-border">
          <span className="text-sm font-medium text-muted-foreground">Currency</span>
          <div className="flex gap-4">
            <span className="text-sm font-medium text-muted-foreground w-24 text-right">Rate (₦)</span>
            <span className="text-sm font-medium text-muted-foreground w-16 text-right">Change</span>
          </div>
        </div>

        {/* Currency Rows */}
        {cbnRates.map((currency, index) => (
          <div
            key={currency.code}
            className={`flex items-center justify-between px-4 py-4 ${
              index !== cbnRates.length - 1 ? "border-b border-border/50" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{currency.flag}</span>
              <div>
                <span className="font-semibold text-card-foreground block">
                  {currency.code}
                </span>
                <span className="text-xs text-muted-foreground">
                  {currency.name}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-card-foreground font-bold w-24 text-right">
                ₦{currency.rate.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              <div className={`flex items-center gap-1 w-16 justify-end ${
                currency.change >= 0 ? "text-green-600" : "text-red-500"
              }`}>
                {currency.change >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">
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
