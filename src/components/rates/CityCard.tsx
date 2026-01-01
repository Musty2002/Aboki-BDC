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
    <div className="bg-card rounded-xl overflow-hidden border border-border shadow-sm">
      {/* City Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 active:bg-muted/50"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <MapPin className="w-4 h-4 text-primary" />
          </div>
          <div className="flex flex-col items-start">
            <h3 className="font-semibold text-card-foreground text-sm">
              {cityData.city} Rate
            </h3>
            <span className="text-xs text-red-500 font-medium">
              {cityData.branches.length} {cityData.branches.length === 1 ? 'office' : 'offices'}
            </span>
          </div>
        </div>
        <ChevronRight 
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
            isExpanded ? "rotate-90" : ""
          }`} 
        />
      </button>

      {/* Branches List */}
      {isExpanded && (
        <div className="border-t border-border bg-muted/30">
          {cityData.branches.map((branch, index) => (
            <button
              key={branch.id}
              onClick={() => onBranchSelect(branch)}
              className={`w-full flex items-center justify-between px-3 py-2.5 active:bg-muted ${
                index !== cityData.branches.length - 1
                  ? "border-b border-border"
                  : ""
              }`}
            >
              <div className="flex-1 text-left pl-10">
                <h4 className="font-medium text-card-foreground text-xs">
                  {branch.name}
                </h4>
                <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                  {branch.address}
                </p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CityCard;
