import { forwardRef, ReactNode, TouchEventHandler } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface PullToRefreshProps {
  children: ReactNode;
  isRefreshing: boolean;
  pullDistance: number;
  onTouchStart: TouchEventHandler;
  onTouchMove: TouchEventHandler;
  onTouchEnd: TouchEventHandler;
  className?: string;
}

const PullToRefresh = forwardRef<HTMLDivElement, PullToRefreshProps>(
  ({ children, isRefreshing, pullDistance, onTouchStart, onTouchMove, onTouchEnd, className }, ref) => {
    const showIndicator = pullDistance > 20 || isRefreshing;
    const rotation = Math.min(pullDistance * 3, 360);

    return (
      <div
        ref={ref}
        className={cn("relative overflow-y-auto", className)}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Pull indicator */}
        <div
          className={cn(
            "absolute left-1/2 -translate-x-1/2 z-10 transition-all duration-200",
            showIndicator ? "opacity-100" : "opacity-0"
          )}
          style={{
            top: Math.max(pullDistance - 40, 8),
          }}
        >
          <div className="w-8 h-8 bg-card rounded-full shadow-lg flex items-center justify-center">
            <RefreshCw
              className={cn(
                "w-4 h-4 text-primary transition-transform",
                isRefreshing && "animate-spin"
              )}
              style={{
                transform: isRefreshing ? undefined : `rotate(${rotation}deg)`,
              }}
            />
          </div>
        </div>

        {/* Content with pull offset */}
        <div
          style={{
            transform: `translateY(${pullDistance}px)`,
            transition: pullDistance === 0 ? "transform 0.2s ease-out" : "none",
          }}
        >
          {children}
        </div>
      </div>
    );
  }
);

PullToRefresh.displayName = "PullToRefresh";

export default PullToRefresh;
