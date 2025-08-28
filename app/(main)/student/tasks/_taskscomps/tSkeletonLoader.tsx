// components/TDashboardSkeleton.tsx
import { Card, CardFooter } from "@/components/ui/card";

export default function TDashboardSkeleton() {
  return (
    <div className="max-w-screen-2xl mx-auto">
      <div className="header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-4 w-64 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>

      {/* Search Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 w-full">
        <div className="relative flex-1 max-w-lg">
          <div className="h-11 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>

      {/* Task Grid Skeleton */}
      <div
        className="grid gap-6 mb-8"
        style={{
          gridTemplateColumns:
            "repeat(auto-fill, minmax(min(100%, 360px), 1fr))",
        }}>
        {[...Array(6)].map((_, i) => (
          <Card
            key={i}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 h-full flex flex-col">
              {/* Header Skeleton */}
              <div>
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div className="flex-1">
                    <div className="h-6 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded-lg animate-pulse mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded-lg animate-pulse w-2/3"></div>
                  </div>
                </div>

                {/* Grade Skeleton */}
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-4 h-4 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>

                {/* Center Skeleton */}
                <div>
                  <div className="h-4 w-16 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
                  <div className="bg-gray-50 border border-gray-100 p-3 rounded-lg">
                    <div className="h-5 w-32 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
                    <div className="flex justify-between">
                      <div className="h-4 w-20 bg-gray-200 rounded-lg animate-pulse"></div>
                      <div className="h-4 w-20 bg-gray-200 rounded-lg animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Skeleton */}
              <div className="mt-auto pt-4 border-t border-gray-100 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="h-3 w-20 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="h-6 w-28 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
              </div>
            </div>
            <CardFooter className="p-4 border-t border-gray-100">
              <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse"></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
