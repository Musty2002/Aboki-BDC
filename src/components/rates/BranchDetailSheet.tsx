import { useState } from "react";
import {
  MapPin,
  Clock,
  Star,
  MessageCircle,
  Copy,
  Check,
  X,
} from "lucide-react";
import { Branch } from "@/data/branchesData";
import { useReviews } from "@/hooks/useReviews";
import {
  Drawer,
  DrawerContent,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import ReviewCard, { AddReviewSheet } from "./ReviewCard";
import { toast } from "@/hooks/use-toast";

interface BranchDetailSheetProps {
  branch: Branch | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getFlagCode = (currencyCode: string): string => {
  const flagMap: Record<string, string> = {
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
  };
  return flagMap[currencyCode] || "us";
};

const BranchDetailSheet = ({
  branch,
  open,
  onOpenChange,
}: BranchDetailSheetProps) => {
  const [copied, setCopied] = useState(false);
  const [showAddReview, setShowAddReview] = useState(false);
  const { reviews, markHelpful } = useReviews(branch?.id || "");

  if (!branch) return null;

  const handleCopyAddress = async () => {
    await navigator.clipboard.writeText(branch.address);
    setCopied(true);
    toast({ title: "Address copied!", duration: 2000 });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const message = `Hello! I'm inquiring about exchange rates at ${branch.name}.`;
    window.open(
      `https://wa.me/${branch.whatsappNumber}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[85vh] bg-white rounded-t-2xl">
          {/* Drag Handle */}
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>

          {/* Header with Close Button */}
          <div className="flex items-center justify-between px-4 pb-2 border-b border-gray-100">
            <div className="w-8" />
            <h2 className="text-sm font-semibold text-gray-900 text-center flex-1">
              {branch.name}
            </h2>
            <button
              onClick={() => onOpenChange(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 active:bg-gray-200"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto max-h-[calc(85vh-60px)] overscroll-contain">
            <div className="px-4 py-3 space-y-3">
              {/* Branch Info */}
              <div className="bg-gray-50 rounded-lg p-2.5 space-y-2">
                {/* Address */}
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 leading-relaxed">{branch.address}</p>
                    <button
                      onClick={handleCopyAddress}
                      className="flex items-center gap-1 text-[10px] text-primary mt-1 active:opacity-70"
                    >
                      {copied ? (
                        <>
                          <Check className="w-2.5 h-2.5" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-2.5 h-2.5" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Operating Hours */}
                <div className="flex items-center gap-2 pt-1.5 border-t border-gray-200">
                  <Clock className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  <p className="text-xs text-gray-700">{branch.operatingHours}</p>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1.5 pt-1.5 border-t border-gray-200">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3 h-3 ${
                          star <= Math.round(branch.rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-medium text-gray-900">{branch.rating}</span>
                  <span className="text-[10px] text-gray-500">({branch.reviewCount} reviews)</span>
                </div>
              </div>

              {/* WhatsApp Button */}
              <Button
                onClick={handleWhatsApp}
                className="w-full h-9 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-xs font-medium rounded-lg"
              >
                <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                Contact via WhatsApp
              </Button>

              {/* Exchange Rates */}
              <div>
                <h3 className="text-xs font-semibold text-gray-900 mb-1.5">
                  Exchange Rates
                </h3>
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  <div className="grid grid-cols-3 gap-1 px-2.5 py-2 bg-gray-100">
                    <span className="text-[10px] font-medium text-gray-500">Currency</span>
                    <span className="text-[10px] font-medium text-gray-500 text-center">Buy</span>
                    <span className="text-[10px] font-medium text-gray-500 text-center">Sell</span>
                  </div>
                  {branch.currencies.map((currency, index) => (
                    <div
                      key={`${currency.code}-${currency.denomination || index}`}
                      className={`grid grid-cols-3 gap-1 px-2.5 py-2 items-center ${
                        index !== branch.currencies.length - 1 ? "border-b border-gray-100" : ""
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <img
                          src={`https://flagcdn.com/20x15/${getFlagCode(currency.code)}.png`}
                          alt={currency.code}
                          className="w-4 h-3 object-cover rounded-sm"
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-gray-900">
                            {currency.code}
                          </span>
                          {currency.denomination && (
                            <span className="text-[9px] text-gray-500">
                              {currency.denomination}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-center text-green-600 font-semibold">
                        ₦{currency.buyRate.toLocaleString()}
                      </span>
                      <span className="text-xs text-center text-red-500 font-semibold">
                        ₦{currency.sellRate.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews Section */}
              <div className="pb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="text-xs font-semibold text-gray-900">
                    Reviews ({reviews.length})
                  </h3>
                  <button
                    onClick={() => setShowAddReview(true)}
                    className="text-[10px] text-primary font-medium active:opacity-70"
                  >
                    Write a review
                  </button>
                </div>

                {reviews.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
                    No reviews yet. Be the first to review!
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {reviews.slice(0, 3).map((review) => (
                      <ReviewCard
                        key={review.id}
                        review={review}
                        onHelpful={markHelpful}
                      />
                    ))}
                    {reviews.length > 3 && (
                      <button className="w-full text-center text-[10px] text-primary font-medium py-1.5 active:opacity-70">
                        View all {reviews.length} reviews
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Add Review Sheet */}
      <AddReviewSheet
        branchId={branch.id}
        branchName={branch.name}
        open={showAddReview}
        onOpenChange={setShowAddReview}
      />
    </>
  );
};

export default BranchDetailSheet;
