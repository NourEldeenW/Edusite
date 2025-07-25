import { Skeleton } from "@/components/ui/skeleton";

export function SubmissionsTableSkeleton() {
  return (
    <div className="w-full space-y-6">
      {/* Filter Section Skeleton */}
      <div className="w-full bg-bg-secondary p-4 rounded-xl border border-border-default flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-grow">
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>

      {/* Table Section Skeleton */}
      <div className="w-full bg-bg-secondary p-4 rounded-xl border border-border-default px-10 pt-6">
        <div className="space-y-4">
          {/* Table Header */}
          <div className="grid grid-cols-9 gap-4 mb-4">
            {[...Array(9)].map((_, i) => (
              <Skeleton key={`header-${i}`} className="h-6 rounded-lg" />
            ))}
          </div>

          {/* Table Rows */}
          {[...Array(5)].map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="grid grid-cols-9 gap-4 py-4 border-t border-border-default">
              {/* Name */}
              <div className="flex items-center space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 w-24 rounded-lg" />
              </div>

              {/* Contact */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4 rounded-lg" />
              </div>

              {/* Center */}
              <div>
                <Skeleton className="h-6 w-full rounded-lg" />
              </div>

              {/* Start Time */}
              <Skeleton className="h-4 w-32 rounded-lg" />

              {/* End Time */}
              <Skeleton className="h-4 w-32 rounded-lg" />

              {/* Status */}
              <Skeleton className="h-6 w-24 rounded-lg" />

              {/* Time Taken */}
              <Skeleton className="h-4 w-16 rounded-lg" />

              {/* Score */}
              <Skeleton className="h-4 w-16 rounded-lg" />

              {/* Actions */}
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
