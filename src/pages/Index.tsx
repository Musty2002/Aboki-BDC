import { useState, useCallback } from "react";
import MobileHeader from "@/components/layout/MobileHeader";
import TabNavigation, { TabType } from "@/components/layout/TabNavigation";
import BDCRatesScreen from "@/components/screens/BDCRatesScreen";
import CBNRatesScreen from "@/components/screens/CBNRatesScreen";
import ConverterScreen from "@/components/screens/ConverterScreen";
import NewsScreen from "@/components/screens/NewsScreen";
import AboutScreen from "@/components/screens/AboutScreen";
import PullToRefresh from "@/components/ui/PullToRefresh";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { toast } from "@/hooks/use-toast";
import { SidebarDrawer } from "@/components/layout/SidebarDrawer";
import { NotificationPanel } from "@/components/layout/NotificationPanel";
import { useNotifications } from "@/hooks/useNotifications";

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabType>("bdc-rates");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { unreadCount } = useNotifications();

  const handleRefresh = useCallback(async () => {
    // Simulate refresh delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setRefreshKey((prev) => prev + 1);
    toast({
      title: "Refreshed",
      description: "Data has been updated",
      duration: 2000,
    });
  }, []);

  const { containerRef, isRefreshing, pullDistance, handlers } = usePullToRefresh({
    onRefresh: handleRefresh,
  });

  const renderScreen = () => {
    switch (activeTab) {
      case "bdc-rates":
        return <BDCRatesScreen key={`bdc-${refreshKey}`} />;
      case "cbn-rates":
        return <CBNRatesScreen key={`cbn-${refreshKey}`} />;
      case "converter":
        return <ConverterScreen key={`converter-${refreshKey}`} />;
      case "news":
        return <NewsScreen key={`news-${refreshKey}`} />;
      case "about":
        return <AboutScreen key={`about-${refreshKey}`} />;
      default:
        return <BDCRatesScreen key={`bdc-default-${refreshKey}`} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      {/* Fixed Header */}
      <MobileHeader
        onMenuClick={() => setSidebarOpen(true)}
        onNotificationClick={() => setNotificationOpen(true)}
        unreadCount={unreadCount}
      />

      {/* Sidebar Drawer */}
      <SidebarDrawer open={sidebarOpen} onOpenChange={setSidebarOpen} />

      {/* Notification Panel */}
      <NotificationPanel open={notificationOpen} onOpenChange={setNotificationOpen} />

      {/* Tab Navigation */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Scrollable Content with Pull to Refresh */}
      <PullToRefresh
        ref={containerRef}
        isRefreshing={isRefreshing}
        pullDistance={pullDistance}
        onTouchStart={handlers.onTouchStart}
        onTouchMove={handlers.onTouchMove}
        onTouchEnd={handlers.onTouchEnd}
        className="flex-1 safe-bottom"
      >
        {renderScreen()}
      </PullToRefresh>
    </div>
  );
};

export default Index;
