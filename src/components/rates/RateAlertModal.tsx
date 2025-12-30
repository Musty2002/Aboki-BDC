import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bell, TrendingUp, TrendingDown } from "lucide-react";
import { allCurrencies } from "@/data/branchesData";
import { useRateAlerts, RateAlert } from "@/hooks/useRateAlerts";

interface RateAlertModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultCurrency?: string;
  branchId?: string;
  branchName?: string;
}

const RateAlertModal = ({
  open,
  onOpenChange,
  defaultCurrency,
  branchId,
  branchName,
}: RateAlertModalProps) => {
  const [currency, setCurrency] = useState(defaultCurrency || "USD");
  const [alertType, setAlertType] = useState<"above" | "below">("above");
  const [targetRate, setTargetRate] = useState("");
  const { addAlert } = useRateAlerts();

  const handleSubmit = () => {
    const rate = parseFloat(targetRate);
    if (isNaN(rate) || rate <= 0) return;

    addAlert({
      currency,
      targetRate: rate,
      type: alertType,
      branchId,
      branchName,
    });

    setTargetRate("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Set Rate Alert
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Currency Select */}
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">
              Currency
            </label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {allCurrencies.map((curr) => (
                  <SelectItem key={curr} value={curr}>
                    {curr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Alert Type */}
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">
              Alert when rate goes
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setAlertType("above")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border transition-colors ${
                  alertType === "above"
                    ? "bg-green-500/10 border-green-500 text-green-600"
                    : "border-border text-muted-foreground hover:bg-secondary/50"
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">Above</span>
              </button>
              <button
                onClick={() => setAlertType("below")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border transition-colors ${
                  alertType === "below"
                    ? "bg-red-500/10 border-red-500 text-red-600"
                    : "border-border text-muted-foreground hover:bg-secondary/50"
                }`}
              >
                <TrendingDown className="w-4 h-4" />
                <span className="text-sm font-medium">Below</span>
              </button>
            </div>
          </div>

          {/* Target Rate */}
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">
              Target rate (₦)
            </label>
            <Input
              type="number"
              value={targetRate}
              onChange={(e) => setTargetRate(e.target.value)}
              placeholder="Enter target rate"
              className="text-lg font-medium"
            />
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={!targetRate || parseFloat(targetRate) <= 0}
            className="w-full"
          >
            Create Alert
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RateAlertModal;
