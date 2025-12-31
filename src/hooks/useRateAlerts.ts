import { useState, useEffect, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface RateAlert {
  id: string;
  currency: string;
  targetRate: number;
  type: "above" | "below";
  branchId?: string;
  branchName?: string;
  enabled: boolean;
  createdAt: string;
  triggeredAt?: string;
}

interface DbRateAlert {
  id: string;
  currency: string;
  target_rate: number;
  alert_type: string;
  branch_id: string | null;
  branch_name: string | null;
  enabled: boolean;
  created_at: string;
  triggered_at: string | null;
  subscription_id: string | null;
}

const SUBSCRIPTION_KEY = 'push_subscription_id';

export const useRateAlerts = () => {
  const [alerts, setAlerts] = useState<RateAlert[]>([]);
  const [loading, setLoading] = useState(true);

  // Load alerts from database on mount
  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    const subscriptionId = localStorage.getItem(SUBSCRIPTION_KEY);
    if (!subscriptionId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('rate_alerts')
        .select('*')
        .eq('subscription_id', subscriptionId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mapped: RateAlert[] = (data || []).map((d: DbRateAlert) => ({
        id: d.id,
        currency: d.currency,
        targetRate: d.target_rate,
        type: d.alert_type as "above" | "below",
        branchId: d.branch_id || undefined,
        branchName: d.branch_name || undefined,
        enabled: d.enabled,
        createdAt: d.created_at,
        triggeredAt: d.triggered_at || undefined,
      }));

      setAlerts(mapped);
    } catch (error) {
      console.error("Failed to load alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  const addAlert = useCallback(async (alert: Omit<RateAlert, "id" | "createdAt" | "enabled">) => {
    const subscriptionId = localStorage.getItem(SUBSCRIPTION_KEY);
    
    if (!subscriptionId) {
      toast({
        title: "Enable Notifications First",
        description: "Please enable push notifications to create alerts",
        variant: "destructive",
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('rate_alerts')
        .insert({
          subscription_id: subscriptionId,
          currency: alert.currency,
          target_rate: alert.targetRate,
          alert_type: alert.type,
          branch_id: alert.branchId || null,
          branch_name: alert.branchName || null,
        })
        .select()
        .single();

      if (error) throw error;

      const newAlert: RateAlert = {
        id: data.id,
        currency: data.currency,
        targetRate: data.target_rate,
        type: data.alert_type as "above" | "below",
        branchId: data.branch_id || undefined,
        branchName: data.branch_name || undefined,
        enabled: data.enabled,
        createdAt: data.created_at,
      };

      setAlerts((prev) => [newAlert, ...prev]);
      
      toast({
        title: "Alert Created",
        description: `You'll be notified when ${alert.currency} goes ${alert.type} ₦${alert.targetRate.toLocaleString()}`,
      });
      
      return newAlert;
    } catch (error) {
      console.error("Failed to create alert:", error);
      toast({
        title: "Error",
        description: "Failed to create alert. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  }, []);

  const removeAlert = useCallback(async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('rate_alerts')
        .delete()
        .eq('id', alertId);

      if (error) throw error;

      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
      toast({
        title: "Alert Removed",
        description: "Rate alert has been deleted",
      });
    } catch (error) {
      console.error("Failed to remove alert:", error);
      toast({
        title: "Error",
        description: "Failed to remove alert",
        variant: "destructive",
      });
    }
  }, []);

  const toggleAlert = useCallback(async (alertId: string) => {
    const alert = alerts.find(a => a.id === alertId);
    if (!alert) return;

    try {
      const { error } = await supabase
        .from('rate_alerts')
        .update({ enabled: !alert.enabled })
        .eq('id', alertId);

      if (error) throw error;

      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, enabled: !a.enabled } : a))
      );
    } catch (error) {
      console.error("Failed to toggle alert:", error);
    }
  }, [alerts]);

  const checkAlerts = useCallback(
    async (currentRates: { currency: string; buyRate: number; sellRate: number }[]) => {
      // Call edge function to check and send push notifications
      try {
        await supabase.functions.invoke('check-rate-alerts', {
          body: { rates: currentRates },
        });
      } catch (error) {
        console.error("Failed to check alerts:", error);
      }
    },
    []
  );

  return {
    alerts,
    loading,
    addAlert,
    removeAlert,
    toggleAlert,
    checkAlerts,
    refreshAlerts: loadAlerts,
  };
};
