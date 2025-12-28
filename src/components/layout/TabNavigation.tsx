import { cn } from "@/lib/utils";

export type TabType = "bdc-rates" | "cbn-rates" | "news" | "about";

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs: { id: TabType; label: string }[] = [
  { id: "bdc-rates", label: "BDC/Rates" },
  { id: "cbn-rates", label: "CBN Rates" },
  { id: "news", label: "News" },
  { id: "about", label: "About us" },
];

const TabNavigation = ({ activeTab, onTabChange }: TabNavigationProps) => {
  return (
    <nav className="bg-primary px-2">
      <div className="flex items-center overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "touch-target px-4 py-3 text-sm font-medium whitespace-nowrap ios-transition relative",
              activeTab === tab.id
                ? "text-primary-foreground"
                : "text-primary-foreground/70 hover:text-primary-foreground/90"
            )}
          >
            {tab.label}
            {/* Active indicator */}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary-foreground rounded-full" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default TabNavigation;
