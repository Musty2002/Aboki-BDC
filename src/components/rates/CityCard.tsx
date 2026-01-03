import { useState } from "react";
import { ChevronRight, MapPin } from "lucide-react";
import { Branch, CityData } from "@/data/branchesData";

interface CityCardProps {
  cityData: CityData;
  onBranchSelect: (branch: Branch) => void;
}

const CityCard = ({ cityData, onBranchSelect }: CityCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-card rounded-xl overflow-hidden border border-border shadow-lg">
      {/* City Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 active:bg-muted/50"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-primary" />
          </div>
          <div className="flex flex-col items-start">
            <h3 className="font-semibold text-card-foreground text-base">
              {cityData.city} RATE
            </h3>
            <span className="text-sm text-primary font-medium">
              {cityData.branches.length} {cityData.branches.length === 1 ? 'office' : 'offices'}
            </span>
          </div>
        </div>
        <ChevronRight 
          className={`w-5 h-5 text-card-foreground/70 transition-transform duration-200 ${
            isExpanded ? "rotate-90" : ""
          }`} 
        />
      </button>

      {/* Branches List */}
      {isExpanded && (
        <div className="border-t border-border bg-card">
          {cityData.branches.map((branch, index) => (
            <button
              key={branch.id}
              onClick={() => onBranchSelect(branch)}
              className={`w-full flex items-center justify-between px-4 py-3 active:bg-muted/50 ${
                index !== cityData.branches.length - 1
                  ? "border-b border-border"
                  : ""
              }`}
            >
              <div className="flex-1 text-left pl-10">
                <h4 className="font-medium text-card-foreground text-sm">
                  {branch.name}
                </h4>
                <p className="text-xs text-card-foreground/70 line-clamp-1 mt-0.5">
                  {branch.address}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-card-foreground/60" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CityCard;
