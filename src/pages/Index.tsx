import { useState } from "react";
import MobileHeader from "@/components/layout/MobileHeader";
import TabNavigation, { TabType } from "@/components/layout/TabNavigation";
import BDCRatesScreen from "@/components/screens/BDCRatesScreen";
import CBNRatesScreen from "@/components/screens/CBNRatesScreen";
import NewsScreen from "@/components/screens/NewsScreen";
import AboutScreen from "@/components/screens/AboutScreen";

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabType>("bdc-rates");
  const [menuOpen, setMenuOpen] = useState(false);

  const renderScreen = () => {
    switch (activeTab) {
      case "bdc-rates":
        return <BDCRatesScreen />;
      case "cbn-rates":
        return <CBNRatesScreen />;
      case "news":
        return <NewsScreen />;
      case "about":
        return <AboutScreen />;
      default:
        return <BDCRatesScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      {/* Fixed Header */}
      <MobileHeader
        onMenuClick={() => setMenuOpen(!menuOpen)}
        onNotificationClick={() => {}}
      />

      {/* Tab Navigation */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto safe-bottom">
        {renderScreen()}
      </main>
    </div>
  );
};

export default Index;
