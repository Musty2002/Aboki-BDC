import { Bell, X, Newspaper, TrendingUp, AlertCircle } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";

interface NotificationPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getNotificationIcon = (type: Notification["type"]) => {
  switch (type) {
    case "news":
      return Newspaper;
    case "rate":
      return TrendingUp;
    case "alert":
      return AlertCircle;
    default:
      return Bell;
  }
};

const getNotificationColor = (type: Notification["type"]) => {
  switch (type) {
    case "news":
      return "text-blue-500 bg-blue-500/10";
    case "rate":
      return "text-green-500 bg-green-500/10";
    case "alert":
      return "text-red-500 bg-red-500/10";
    default:
      return "text-primary bg-primary/10";
  }
};

export function NotificationPanel({ open, onOpenChange }: NotificationPanelProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[320px] p-0 bg-background">
        <SheetHeader className="bg-primary p-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-primary-foreground flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </SheetTitle>
          </div>
        </SheetHeader>

        {notifications.length > 0 && (
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <button
              onClick={markAllAsRead}
              className="text-xs text-primary hover:underline"
            >
              Mark all as read
            </button>
            <button
              onClick={clearAll}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear all
            </button>
          </div>
        )}

        <ScrollArea className="h-[calc(100vh-140px)]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Bell className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">No notifications yet</p>
              <p className="text-xs mt-1">We'll notify you of news and rate updates</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);
                const colorClass = getNotificationColor(notification.type);

                return (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${
                      !notification.read ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`p-2 rounded-full ${colorClass}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={`text-sm font-medium truncate ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}>
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground/60 mt-2">
                          {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
