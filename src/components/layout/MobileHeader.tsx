import { Bell, Menu } from "lucide-react";
import abokiLogo from "@/assets/aboki-logo.jpg";

interface MobileHeaderProps {
  onMenuClick?: () => void;
  onNotificationClick?: () => void;
}

const MobileHeader = ({ onMenuClick, onNotificationClick }: MobileHeaderProps) => {
  return (
    <header className="bg-primary safe-top sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-2">
        {/* Logo/Brand */}
        <div className="flex items-center gap-2">
          <img 
            src={abokiLogo} 
            alt="Aboki BDC" 
            className="w-8 h-8 rounded-full object-cover"
          />
          <h1 className="font-semibold text-sm text-primary-foreground tracking-tight whitespace-nowrap">
            Aboki Bureau De Change
          </h1>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onNotificationClick}
            className="touch-target flex items-center justify-center text-primary-foreground hover:opacity-80 ios-transition"
            aria-label="Notifications"
          >
            <Bell className="w-6 h-6" />
          </button>
          <button
            onClick={onMenuClick}
            className="touch-target flex items-center justify-center text-primary-foreground hover:opacity-80 ios-transition"
            aria-label="Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;
