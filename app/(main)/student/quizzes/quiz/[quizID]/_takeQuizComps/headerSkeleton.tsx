// components/student/quizzes/header/HeaderSkeleton.tsx
export default function HeaderSkeleton() {
  return (
    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl shadow-lg p-6 mb-8 border border-indigo-100 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200 rounded-full opacity-10 -mt-16 -mr-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-200 rounded-full opacity-10 -mb-12 -ml-12"></div>

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          {/* Left Content */}
          <div className="flex-1">
            {/* Title and badge skeleton */}
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 bg-gray-200 rounded-full w-3/4 animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse"></div>
            </div>

            {/* Description skeleton */}
            <div className="space-y-2 mt-4">
              <div className="h-4 bg-gray-200 rounded-full w-11/12 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded-full w-10/12 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded-full w-9/12 animate-pulse"></div>
            </div>

            {/* Info cards skeleton */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center text-sm bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                  <div className="h-6 w-6 bg-gray-200 rounded-full mr-2 animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-3 bg-gray-200 rounded-full w-16 mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded-full w-24 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timer skeleton */}
          <div className="w-full md:w-48 flex-shrink-0">
            <div className="flex flex-col items-center justify-center rounded-xl p-4 bg-indigo-50 border-2 border-indigo-200">
              <div className="flex items-center text-sm font-medium mb-4">
                <div className="h-4 w-4 bg-gray-200 rounded-full mr-2 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded-full w-24 animate-pulse"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded-xl w-24 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded-full w-32 mt-3 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
