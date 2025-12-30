import { useState, useEffect } from "react";
import {
  MapPin,
  Phone,
  Clock,
  Star,
  MessageCircle,
  Bell,
  Copy,
  Check,
  ChevronRight,
} from "lucide-react";
import { Branch, Review } from "@/data/branchesData";
import { useReviews } from "@/hooks/useReviews";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReviewCard, { AddReviewSheet } from "./ReviewCard";
import RateAlertModal from "./RateAlertModal";
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
  const [showRateAlert, setShowRateAlert] = useState(false);
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
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="border-b border-border/50 pb-4">
            <DrawerTitle className="text-center">{branch.name}</DrawerTitle>
          </DrawerHeader>

          <ScrollArea className="flex-1 max-h-[calc(90vh-80px)]">
            <div className="p-4 space-y-5">
              {/* Branch Info */}
              <div className="space-y-3">
                {/* Address */}
                <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-xl">
                  <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-card-foreground">{branch.address}</p>
                    <button
                      onClick={handleCopyAddress}
                      className="flex items-center gap-1 text-xs text-primary mt-1 hover:underline"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copy address
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Operating Hours */}
                <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl">
                  <Clock className="w-5 h-5 text-primary flex-shrink-0" />
                  <p className="text-sm text-card-foreground">
                    {branch.operatingHours}
                  </p>
                </div>

                {/* Rating */}
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= Math.round(branch.rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-card-foreground">
                      {branch.rating}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      ({branch.reviewCount} reviews)
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handleWhatsApp}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
                <Button
                  onClick={() => setShowRateAlert(true)}
                  variant="outline"
                  className="flex-1"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Set Alert
                </Button>
              </div>

              {/* Exchange Rates */}
              <div>
                <h3 className="text-sm font-semibold text-card-foreground mb-3">
                  Exchange Rates
                </h3>
                <div className="bg-secondary/30 rounded-xl overflow-hidden">
                  <div className="grid grid-cols-3 gap-2 p-3 bg-secondary/50 text-xs font-medium text-muted-foreground">
                    <span>Currency</span>
                    <span className="text-center">Buy</span>
                    <span className="text-center">Sell</span>
                  </div>
                  {branch.currencies.map((currency) => (
                    <div
                      key={currency.code}
                      className="grid grid-cols-3 gap-2 p-3 border-t border-border/30 items-center"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={`https://flagcdn.com/24x18/${getFlagCode(currency.code)}.png`}
                          alt={currency.code}
                          className="w-5 h-4 object-cover rounded-sm"
                        />
                        <span className="text-sm font-medium text-card-foreground">
                          {currency.code}
                        </span>
                      </div>
                      <span className="text-sm text-center text-green-600 font-medium">
                        ₦{currency.buyRate.toLocaleString()}
                      </span>
                      <span className="text-sm text-center text-red-500 font-medium">
                        ₦{currency.sellRate.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-card-foreground">
                    Reviews ({reviews.length})
                  </h3>
                  <button
                    onClick={() => setShowAddReview(true)}
                    className="text-xs text-primary font-medium hover:underline"
                  >
                    Write a review
                  </button>
                </div>

                {reviews.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4 bg-secondary/30 rounded-xl">
                    No reviews yet. Be the first to review!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {reviews.slice(0, 3).map((review) => (
                      <ReviewCard
                        key={review.id}
                        review={review}
                        onHelpful={markHelpful}
                      />
                    ))}
                    {reviews.length > 3 && (
                      <button className="w-full text-center text-sm text-primary font-medium py-2 hover:underline">
                        View all {reviews.length} reviews
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </DrawerContent>
      </Drawer>

      {/* Add Review Sheet */}
      <AddReviewSheet
        branchId={branch.id}
        branchName={branch.name}
        open={showAddReview}
        onOpenChange={setShowAddReview}
      />

      {/* Rate Alert Modal */}
      <RateAlertModal
        open={showRateAlert}
        onOpenChange={setShowRateAlert}
        branchId={branch.id}
        branchName={branch.name}
      />
    </>
  );
};

export default BranchDetailSheet;
