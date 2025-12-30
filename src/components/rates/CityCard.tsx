import { useState } from "react";
import { ChevronRight, MapPin, Star } from "lucide-react";
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
    <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm">
      {/* City Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 active:bg-gray-50"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <MapPin className="w-4 h-4 text-primary" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900 text-sm">
              {cityData.city}
            </h3>
            <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
              <span>{totalBranches} {totalBranches === 1 ? "branch" : "branches"}</span>
              <span>•</span>
              <div className="flex items-center gap-0.5">
                <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                <span>{avgRating.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>
        <ChevronRight 
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isExpanded ? "rotate-90" : ""
          }`} 
        />
      </button>

      {/* Branches List */}
      {isExpanded && (
        <div className="border-t border-gray-100 bg-gray-50/50">
          {cityData.branches.map((branch, index) => (
            <button
              key={branch.id}
              onClick={() => onBranchSelect(branch)}
              className={`w-full flex items-center justify-between px-3 py-2.5 active:bg-gray-100 ${
                index !== cityData.branches.length - 1
                  ? "border-b border-gray-100"
                  : ""
              }`}
            >
              <div className="flex-1 text-left pl-10">
                <h4 className="font-medium text-gray-800 text-xs">
                  {branch.name}
                </h4>
                <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">
                  {branch.address}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-2.5 h-2.5 ${
                          star <= Math.round(branch.rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="text-[10px] text-gray-500 ml-0.5">
                      ({branch.reviewCount})
                    </span>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CityCard;
