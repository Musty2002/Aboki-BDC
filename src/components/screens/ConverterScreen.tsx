import { useState, useMemo } from "react";
import { ArrowUpDown, Share2 } from "lucide-react";

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

const branches = [
  { id: "abuja", name: "Abuja" },
  { id: "lagos", name: "Lagos" },
  { id: "port-harcourt", name: "Port Harcourt" },
  { id: "kano", name: "Kano" },
  { id: "kaduna", name: "Kaduna" },
  { id: "bauchi", name: "Bauchi" },
];

const currencies = [
  { code: "USD", name: "US Dollar", buyRate: 1580, sellRate: 1620 },
  { code: "EUR", name: "Euro", buyRate: 1680, sellRate: 1720 },
  { code: "GBP", name: "British Pound", buyRate: 1950, sellRate: 2000 },
  { code: "CAD", name: "Canadian Dollar", buyRate: 1150, sellRate: 1180 },
  { code: "AED", name: "UAE Dirham", buyRate: 425, sellRate: 440 },
  { code: "ZAR", name: "South African Rand", buyRate: 85, sellRate: 92 },
  { code: "CNY", name: "Chinese Yuan", buyRate: 215, sellRate: 225 },
  { code: "CHF", name: "Swiss Franc", buyRate: 1780, sellRate: 1830 },
];

const ConverterScreen = () => {
  const [selectedBranch, setSelectedBranch] = useState(branches[0].id);
  const [selectedCurrency, setSelectedCurrency] = useState(currencies[0].code);
  const [isBuying, setIsBuying] = useState(true);
  const [amount, setAmount] = useState("");

  const currency = currencies.find((c) => c.code === selectedCurrency)!;
  const rate = isBuying ? currency.buyRate : currency.sellRate;

  const result = useMemo(() => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return 0;
    return isBuying ? numAmount * rate : numAmount / rate;
  }, [amount, rate, isBuying]);

  const handleShare = () => {
    const text = isBuying
      ? `Converting ${amount} ${selectedCurrency} = ₦${result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} at Aboki BDC ${branches.find(b => b.id === selectedBranch)?.name} branch`
      : `Converting ₦${amount} = ${result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${selectedCurrency} at Aboki BDC ${branches.find(b => b.id === selectedBranch)?.name} branch`;
    
    if (navigator.share) {
      navigator.share({ text });
    }
  };

  return (
    <div className="p-3 pb-6">
      {/* Branch Selection */}
      <div className="bg-card rounded-xl p-3 shadow-lg mb-3">
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
          Select Branch
        </label>
        <select
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          className="w-full bg-secondary/30 rounded-lg px-3 py-2.5 text-xs text-card-foreground border-0 focus:ring-2 focus:ring-primary outline-none"
        >
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>
      </div>

      {/* Buy/Sell Toggle */}
      <div className="bg-card rounded-xl p-3 shadow-lg mb-3">
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
          Transaction Type
        </label>
        <div className="flex bg-secondary/30 rounded-lg p-1">
          <button
            onClick={() => setIsBuying(true)}
            className={`flex-1 py-2 text-xs font-medium rounded-md ios-transition ${
              isBuying
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground"
            }`}
          >
            Buy Foreign Currency
          </button>
          <button
            onClick={() => setIsBuying(false)}
            className={`flex-1 py-2 text-xs font-medium rounded-md ios-transition ${
              !isBuying
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground"
            }`}
          >
            Sell Foreign Currency
          </button>
        </div>
      </div>

      {/* Currency Selection */}
      <div className="bg-card rounded-xl p-3 shadow-lg mb-3">
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
          Select Currency
        </label>
        <div className="grid grid-cols-4 gap-2">
          {currencies.map((curr) => (
            <button
              key={curr.code}
              onClick={() => setSelectedCurrency(curr.code)}
              className={`flex flex-col items-center p-2 rounded-lg ios-transition ${
                selectedCurrency === curr.code
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/30 text-card-foreground"
              }`}
            >
              <img
                src={`https://flagcdn.com/24x18/${getFlagCode(curr.code)}.png`}
                alt={curr.code}
                className="w-5 h-4 object-cover rounded-sm mb-1"
              />
              <span className="text-[10px] font-medium">{curr.code}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Amount Input */}
      <div className="bg-card rounded-xl p-3 shadow-lg mb-3">
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
          {isBuying ? `Amount in ${selectedCurrency}` : "Amount in NGN (₦)"}
        </label>
        <div className="flex items-center gap-2 bg-secondary/30 rounded-lg px-3 py-2.5">
          <span className="text-xs font-medium text-muted-foreground">
            {isBuying ? selectedCurrency : "₦"}
          </span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="flex-1 bg-transparent text-card-foreground text-sm outline-none"
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
          <span>Rate: ₦{rate.toLocaleString()} per {selectedCurrency}</span>
          <span>{isBuying ? "Buying" : "Selling"} rate</span>
        </div>
      </div>

      {/* Swap Indicator */}
      <div className="flex justify-center my-2">
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
          <ArrowUpDown className="w-4 h-4 text-primary-foreground" />
        </div>
      </div>

      {/* Result */}
      <div className="bg-card rounded-xl p-4 shadow-lg mb-3">
        <label className="text-xs font-medium text-muted-foreground mb-1 block">
          {isBuying ? "You will pay (NGN)" : `You will receive (${selectedCurrency})`}
        </label>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isBuying ? (
              <img
                src={`https://flagcdn.com/24x18/ng.png`}
                alt="NGN"
                className="w-6 h-5 object-cover rounded-sm"
              />
            ) : (
              <img
                src={`https://flagcdn.com/24x18/${getFlagCode(selectedCurrency)}.png`}
                alt={selectedCurrency}
                className="w-6 h-5 object-cover rounded-sm"
              />
            )}
            <span className="text-lg font-bold text-card-foreground">
              {isBuying ? "₦" : ""}{result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              {!isBuying ? ` ${selectedCurrency}` : ""}
            </span>
          </div>
          <button
            onClick={handleShare}
            className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center"
          >
            <Share2 className="w-4 h-4 text-primary" />
          </button>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-secondary/30 rounded-xl p-3">
        <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
          Rates shown are for reference only and may vary at the time of transaction. 
          Please contact the branch for current rates.
        </p>
      </div>
    </div>
  );
};

export default ConverterScreen;
