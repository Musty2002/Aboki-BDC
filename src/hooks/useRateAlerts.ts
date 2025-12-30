import { useState, useEffect, useCallback } from "react";
import { toast } from "@/hooks/use-toast";

export interface RateAlert {
  id: string;
  currency: string;
  targetRate: number;
  type: "above" | "below";
  branchId?: string;
  branchName?: string;
  enabled: boolean;
  createdAt: string;
}

const STORAGE_KEY = "bdc_rate_alerts";

export const useRateAlerts = () => {
  const [alerts, setAlerts] = useState<RateAlert[]>([]);

  // Load alerts from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setAlerts(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse rate alerts:", e);
      }
    }
  }, []);

  // Save alerts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
  }, [alerts]);

  const addAlert = useCallback((alert: Omit<RateAlert, "id" | "createdAt" | "enabled">) => {
    const newAlert: RateAlert = {
      ...alert,
      id: `alert_${Date.now()}`,
      enabled: true,
      createdAt: new Date().toISOString(),
    };
    setAlerts((prev) => [...prev, newAlert]);
    toast({
      title: "Alert Created",
      description: `You'll be notified when ${alert.currency} goes ${alert.type} ₦${alert.targetRate.toLocaleString()}`,
    });
    return newAlert;
  }, []);

  const removeAlert = useCallback((alertId: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    toast({
      title: "Alert Removed",
      description: "Rate alert has been deleted",
    });
  }, []);

  const toggleAlert = useCallback((alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, enabled: !a.enabled } : a))
    );
  }, []);

  const checkAlerts = useCallback(
    (currentRates: { currency: string; buyRate: number; sellRate: number }[]) => {
      const enabledAlerts = alerts.filter((a) => a.enabled);
      
      enabledAlerts.forEach((alert) => {
        const rateInfo = currentRates.find((r) => r.currency === alert.currency);
        if (!rateInfo) return;

        const currentRate = alert.type === "above" ? rateInfo.sellRate : rateInfo.buyRate;
        const triggered =
          alert.type === "above"
            ? currentRate >= alert.targetRate
            : currentRate <= alert.targetRate;

        if (triggered) {
          toast({
            title: `🔔 Rate Alert: ${alert.currency}`,
            description: `${alert.currency} rate is now ${alert.type} ₦${alert.targetRate.toLocaleString()}! Current: ₦${currentRate.toLocaleString()}`,
            duration: 10000,
          });
        }
      });
    },
    [alerts]
  );

  return {
    alerts,
    addAlert,
    removeAlert,
    toggleAlert,
    checkAlerts,
  };
};
