import { Skeleton } from "@/components/ui/skeleton";

export default function AllWeeksSkeleton() {
  return (
    <>
      {/* Title Section */}
      <div className="mb-8">
        <Skeleton className="h-9 w-64 rounded-md" />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 mb-8 grid-cols-1 sm:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="bg-bg-secondary rounded-xl shadow p-5 flex items-center">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="ml-4 flex-1">
              <Skeleton className="h-5 w-24 mb-2" />
              <Skeleton className="h-8 w-12" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(250px,1fr)_3fr] gap-6">
        {/* Material Types Card */}
        <div className="bg-bg-secondary rounded-xl shadow p-6">
          <Skeleton className="h-7 w-36 mb-4" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="flex items-center">
                  <Skeleton className="w-5 h-5 mr-4 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-6 w-8 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Weeks Section */}
        <div className="bg-bg-secondary rounded-xl shadow p-6">
          <Skeleton className="h-7 w-36 mb-5" />
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex flex-col h-full bg-white border border-border-default rounded-xl p-5">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-6 w-12 rounded-full" />
                </div>

                <div className="my-4 flex-grow">
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-5/6 mb-1" />
                  <Skeleton className="h-4 w-2/3 mb-4" />

                  <div className="flex flex-wrap gap-2">
                    {[...Array(4)].map((_, iconIndex) => (
                      <Skeleton
                        key={iconIndex}
                        className="w-7 h-7 rounded-md"
                      />
                    ))}
                    <Skeleton className="w-7 h-7 rounded-md" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
