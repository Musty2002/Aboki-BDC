import { useState } from "react";
import { Search, X, Filter } from "lucide-react";
import { allCurrencies } from "@/data/branchesData";

interface SearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCurrencies: string[];
  onCurrencyToggle: (currency: string) => void;
  onClearFilters: () => void;
}

const SearchFilter = ({
  searchQuery,
  onSearchChange,
  selectedCurrencies,
  onCurrencyToggle,
  onClearFilters,
}: SearchFilterProps) => {
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters = selectedCurrencies.length > 0 || searchQuery.length > 0;

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search city or branch..."
          className="w-full pl-10 pr-10 py-2.5 bg-secondary/30 border border-border/50 rounded-xl text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
            showFilters || selectedCurrencies.length > 0
              ? "bg-primary text-primary-foreground"
              : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
          }`}
        >
          <Filter className="w-4 h-4" />
          <span>Filter by Currency</span>
          {selectedCurrencies.length > 0 && (
            <span className="bg-primary-foreground/20 px-1.5 py-0.5 rounded-full text-xs">
              {selectedCurrencies.length}
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-xs text-destructive hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Currency Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-2">
          {allCurrencies.map((currency) => (
            <button
              key={currency}
              onClick={() => onCurrencyToggle(currency)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedCurrencies.includes(currency)
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
              }`}
            >
              {currency}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchFilter;
