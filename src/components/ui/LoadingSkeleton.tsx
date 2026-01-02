import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(({ className }, ref) => (
  <div ref={ref} className={cn("animate-pulse bg-muted rounded", className)} />
));
Skeleton.displayName = "Skeleton";

export const RateCardSkeleton = () => (
  <div className="bg-card rounded-xl p-3 shadow-lg">
    <div className="flex items-center gap-2 mb-3">
      <Skeleton className="w-8 h-8 rounded-full" />
      <Skeleton className="h-4 w-24" />
    </div>
    <div className="space-y-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <Skeleton className="w-5 h-4 rounded-sm" />
            <Skeleton className="h-3 w-8" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const CBNRateSkeleton = () => (
  <div className="p-3 pb-6">
    <div className="bg-card rounded-xl p-3 mb-3 shadow-lg">
      <Skeleton className="h-4 w-32 mb-2" />
      <Skeleton className="h-3 w-48" />
    </div>
    <div className="bg-card rounded-xl overflow-hidden shadow-lg">
      <div className="px-3 py-2 bg-secondary/10 border-b border-border">
        <Skeleton className="h-3 w-full" />
      </div>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="flex items-center justify-between px-3 py-2.5 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Skeleton className="w-5 h-4 rounded-sm" />
            <div>
              <Skeleton className="h-3 w-8 mb-1" />
              <Skeleton className="h-2 w-16" />
            </div>
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-10" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const NewsCardSkeleton = () => (
  <div className="bg-card rounded-xl p-3 shadow-lg">
    <div className="flex items-start justify-between gap-2">
      <div className="flex-1">
        <Skeleton className="h-4 w-20 mb-2" />
        <Skeleton className="h-3 w-full mb-1" />
        <Skeleton className="h-3 w-3/4 mb-2" />
        <Skeleton className="h-2 w-24" />
      </div>
      <Skeleton className="w-4 h-4 rounded" />
    </div>
  </div>
);

export const NewsSkeleton = () => (
  <div className="p-3 pb-6">
    <div className="bg-card rounded-xl overflow-hidden shadow-lg mb-3">
      <div className="bg-primary/50 p-4">
        <Skeleton className="h-4 w-16 mb-2 bg-primary-foreground/20" />
        <Skeleton className="h-4 w-48 mb-1 bg-primary-foreground/20" />
        <Skeleton className="h-3 w-full mb-2 bg-primary-foreground/20" />
        <Skeleton className="h-2 w-24 bg-primary-foreground/20" />
      </div>
    </div>
    <Skeleton className="h-4 w-24 mb-2" />
    <div className="flex flex-col gap-2">
      {[1, 2, 3, 4].map((i) => (
        <NewsCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

export const AboutSkeleton = () => (
  <div className="p-3 pb-6">
    <div className="bg-card rounded-xl p-3 shadow-lg mb-3">
      <div className="flex items-center gap-2 mb-3">
        <Skeleton className="w-9 h-9 rounded-lg" />
        <div>
          <Skeleton className="h-4 w-40 mb-1" />
          <Skeleton className="h-2 w-24" />
        </div>
      </div>
      <Skeleton className="h-3 w-full mb-1" />
      <Skeleton className="h-3 w-3/4" />
    </div>
    <div className="bg-card rounded-xl p-3 shadow-lg mb-3">
      <Skeleton className="h-4 w-32 mb-2" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex justify-between py-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      ))}
    </div>
    <Skeleton className="h-4 w-24 mb-2" />
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-card rounded-xl p-3 shadow-lg mb-2">
        <div className="flex items-start gap-2">
          <Skeleton className="w-8 h-8 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-3 w-20 mb-1" />
            <Skeleton className="h-2 w-full mb-1" />
            <Skeleton className="h-2 w-32" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const ConverterSkeleton = () => (
  <div className="p-3 pb-6">
    <div className="bg-primary/50 rounded-xl p-3 mb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="w-7 h-7 rounded-full bg-primary-foreground/20" />
          <div>
            <Skeleton className="h-2 w-12 mb-1 bg-primary-foreground/20" />
            <Skeleton className="h-3 w-16 bg-primary-foreground/20" />
          </div>
        </div>
        <div className="text-right">
          <Skeleton className="h-2 w-8 mb-1 bg-primary-foreground/20" />
          <Skeleton className="h-3 w-20 bg-primary-foreground/20" />
        </div>
      </div>
    </div>
    <div className="bg-card rounded-2xl shadow-xl overflow-hidden mb-3">
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-2 w-16" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-20 rounded-lg" />
          <Skeleton className="h-10 flex-1 rounded-lg" />
        </div>
      </div>
      <div className="p-4 bg-secondary/10">
        <Skeleton className="h-2 w-20 mb-3" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="h-6 flex-1 rounded-lg" />
        </div>
      </div>
    </div>
    <div className="bg-card rounded-xl p-3 shadow-lg mb-3">
      <Skeleton className="h-2 w-24 mb-2" />
      <div className="grid grid-cols-4 gap-1.5">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Skeleton key={i} className="h-14 rounded-xl" />
        ))}
      </div>
    </div>
  </div>
);

export default Skeleton;
