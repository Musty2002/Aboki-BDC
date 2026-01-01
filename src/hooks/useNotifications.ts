import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "news" | "rate" | "alert" | "general";
  read: boolean;
  timestamp: string;
  data?: Record<string, unknown>;
}

const STORAGE_KEY = "aboki_notifications";

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  // Save to localStorage whenever notifications change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  // Subscribe to real-time news updates
  useEffect(() => {
    const channel = supabase
      .channel("news-updates")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "news_cache",
        },
        (payload) => {
          console.log("New news cache entry:", payload);
          
          // Parse articles from the new cache entry
          const articles = payload.new.articles as Array<{
            title?: string;
            description?: string;
          }>;
          
          if (articles && articles.length > 0) {
            const firstArticle = articles[0];
            const newNotification: Notification = {
              id: `news-${Date.now()}`,
              title: "📰 New Financial News",
              message: firstArticle.title || "New articles available",
              type: "news",
              read: false,
              timestamp: new Date().toISOString(),
              data: { articleCount: articles.length },
            };

            addNotification(newNotification);
            
            // Show toast for immediate feedback
            toast({
              title: "📰 New News Available",
              description: `${articles.length} new article${articles.length > 1 ? "s" : ""} about Nigerian economy`,
              duration: 5000,
            });
          }
        }
      )
      .subscribe();

    // Also subscribe to rate changes for rate alerts
    const rateChannel = supabase
      .channel("rate-updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "branch_rates",
        },
        (payload) => {
          console.log("Rate update:", payload);
          
          // Only notify for significant changes
          const oldRate = payload.old.buy_rate as number;
          const newRate = payload.new.buy_rate as number;
          const percentChange = Math.abs((newRate - oldRate) / oldRate * 100);
          
          if (percentChange >= 1) { // 1% or more change
            const newNotification: Notification = {
              id: `rate-${Date.now()}`,
              title: "📈 Exchange Rate Update",
              message: `Rates have changed by ${percentChange.toFixed(1)}%`,
              type: "rate",
              read: false,
              timestamp: new Date().toISOString(),
              data: { oldRate, newRate },
            };

            addNotification(newNotification);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(rateChannel);
    };
  }, []);

  const addNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => {
      // Prevent duplicates
      if (prev.some((n) => n.id === notification.id)) {
        return prev;
      }
      return [notification, ...prev].slice(0, 50); // Keep max 50 notifications
    });
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
  };
}
