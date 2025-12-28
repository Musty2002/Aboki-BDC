import { Bell, Menu } from "lucide-react";

interface MobileHeaderProps {
  onMenuClick?: () => void;
  onNotificationClick?: () => void;
}

const MobileHeader = ({ onMenuClick, onNotificationClick }: MobileHeaderProps) => {
  return (
    <header className="bg-primary safe-top sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo/Brand */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-8 flex items-center justify-center">
            <svg viewBox="0 0 24 32" className="w-full h-full text-primary-foreground">
              <path
                d="M12 2C12 2 4 8 4 16C4 24 12 30 12 30C12 30 20 24 20 16C20 8 12 2 12 2Z"
                fill="currentColor"
              />
              <circle cx="12" cy="14" r="4" fill="hsl(var(--primary))" />
            </svg>
          </div>
          <h1 className="font-brand text-xl text-primary-foreground tracking-wide">
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
