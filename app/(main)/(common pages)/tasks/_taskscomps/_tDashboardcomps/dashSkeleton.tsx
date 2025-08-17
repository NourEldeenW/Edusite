export default function TDashboardSkeleton() {
  return (
    <div className="max-w-screen-2xl mx-auto animate-pulse">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="space-y-3 w-full sm:w-auto">
          <div className="h-7 bg-gray-200 rounded-full w-48" />
          <div className="h-4 bg-gray-200 rounded-full w-72" />
        </div>
        <div className="h-10 bg-gray-200 rounded-full w-40" />
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 w-full">
        <div className="flex-1 max-w-lg h-11 bg-gray-200 rounded-full" />
        <div className="h-11 bg-gray-200 rounded-full w-48" />
      </div>

      {/* Task Grid Skeletons */}
      <div
        className="grid gap-6 mb-8"
        style={{
          gridTemplateColumns:
            "repeat(auto-fill, minmax(min(100%, 360px), 1fr))",
        }}>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-gray-100 rounded-3xl shadow-sm border border-gray-200 p-6 h-[420px] flex flex-col">
            {/* Title & Buttons */}
            <div className="flex justify-between items-start gap-4 mb-4">
              <div className="space-y-2 flex-1">
                <div className="h-5 bg-gray-200 rounded-full w-3/4" />
                <div className="h-4 bg-gray-200 rounded-full w-full" />
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-8 bg-gray-200 rounded-full" />
                <div className="h-8 w-8 bg-gray-200 rounded-full" />
              </div>
            </div>

            {/* Grade */}
            <div className="flex items-center gap-2 mb-5">
              <div className="h-4 w-4 bg-gray-200 rounded-full" />
              <div className="h-4 bg-gray-200 rounded-full w-24" />
            </div>

            {/* Centers */}
            <div className="space-y-3 flex-1">
              <div className="h-3 bg-gray-300 rounded-full w-20" />
              <div className="space-y-3">
                {[...Array(2)].map((_, j) => (
                  <div
                    key={j}
                    className="bg-gray-200 p-3 rounded-2xl space-y-2">
                    <div className="h-3 bg-gray-300 rounded-full w-32" />
                    <div className="flex justify-between">
                      <div className="h-3 bg-gray-300 rounded-full w-16" />
                      <div className="h-3 bg-gray-300 rounded-full w-16" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-auto pt-4 border-t border-gray-300 space-y-3">
              {[...Array(3)].map((_, k) => (
                <div
                  key={k}
                  className="flex justify-between items-center gap-2">
                  <div className="h-3 bg-gray-300 rounded-full w-20" />
                  <div className="h-5 bg-gray-200 rounded-full w-16" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
