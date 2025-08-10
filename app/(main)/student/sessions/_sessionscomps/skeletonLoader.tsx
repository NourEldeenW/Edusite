import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Skeleton Loader Component
function SkeletonLoader() {
  return (
    <div className="space-y-6">
      <div className="space-y-1 mb-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-5 w-80" />
      </div>

      {/* Stats Skeleton */}
      <div className="grid gap-5 mb-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="w-10 h-10 rounded-full" />
            </div>
            <Skeleton className="h-8 w-20 mt-3" />
          </div>
        ))}
      </div>

      {/* Controls Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <Skeleton className="h-10 w-full sm:w-80" />
        <div className="hidden sm:flex gap-3">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>
        <Skeleton className="h-10 w-20 ml-auto" />
      </div>

      {/* Table Skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {[...Array(6)].map((_, i) => (
                  <th key={i} className="py-4 px-6">
                    <Skeleton className="h-5 w-24 mx-auto" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {[...Array(5)].map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {[...Array(6)].map((_, cellIndex) => (
                    <td key={cellIndex} className="py-4 px-6">
                      <Skeleton
                        className={cn(
                          "h-5 mx-auto",
                          cellIndex === 1 ? "w-48" : "w-32"
                        )}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SkeletonLoader;
