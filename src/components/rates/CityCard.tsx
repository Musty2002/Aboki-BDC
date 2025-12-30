import { useState } from "react";
import { ChevronDown, ChevronUp, MapPin, Star } from "lucide-react";
import { Branch, CityData } from "@/data/branchesData";

interface CityCardProps {
  cityData: CityData;
  onBranchSelect: (branch: Branch) => void;
}

const CityCard = ({ cityData, onBranchSelect }: CityCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const totalBranches = cityData.branches.length;
  const avgRating =
    cityData.branches.reduce((acc, b) => acc + b.rating, 0) / totalBranches;

  return (
    <div className="bg-card rounded-2xl shadow-md overflow-hidden border border-border/50">
      {/* City Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-card-foreground text-base">
              {cityData.city}
            </h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{totalBranches} {totalBranches === 1 ? "branch" : "branches"}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span>{avgRating.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
            {totalBranches}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Branches List */}
      {isExpanded && (
        <div className="border-t border-border/50">
          {cityData.branches.map((branch, index) => (
            <button
              key={branch.id}
              onClick={() => onBranchSelect(branch)}
              className={`w-full flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors ${
                index !== cityData.branches.length - 1
                  ? "border-b border-border/30"
                  : ""
              }`}
            >
              <div className="flex-1 text-left">
                <h4 className="font-semibold text-card-foreground text-sm">
                  {branch.name}
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                  {branch.address}
                </p>
                <div className="flex items-center gap-3 mt-1.5">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3 h-3 ${
                          star <= Math.round(branch.rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">
                      ({branch.reviewCount})
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {branch.currencies.length} currencies
                  </span>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground rotate-[-90deg]" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CityCard;
