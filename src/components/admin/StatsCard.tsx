import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatsCard({ title, value, icon: Icon, description, trend, className }: StatsCardProps) {
  return (
    <div className={cn("bg-white rounded-xl p-6 border border-slate-200", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          {description && (
            <p className="text-xs text-slate-500 mt-1">{description}</p>
          )}
          {trend && (
            <p className={cn(
              "text-xs mt-2 font-medium",
              trend.isPositive ? "text-green-600" : "text-red-600"
            )}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% from last week
            </p>
          )}
        </div>
        <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center">
          <Icon className="h-5 w-5 text-red-600" />
        </div>
      </div>
    </div>
  );
}
