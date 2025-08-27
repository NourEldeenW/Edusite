// app/(main)/tasks/[taskID]/submissions/[sID]/errorpag.tsx
"use client";

export default function ErrorPage({
  title,
  message,
  role,
  error,
}: {
  title: string;
  message: string;
  role: string;
  error?: string;
}) {
  return (
    <>
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <div className="bg-white p-8 rounded-lg border border-gray-200 text-center max-w-4xl">
          <div className="text-5xl text-red-500 mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{title}</h2>
          <p className="text-gray-600 mb-6">{message}</p>

          {error && (
            <div className="p-4 bg-gray-100 rounded-md text-left font-mono text-sm text-red-600 mb-6">
              Error: {error}
            </div>
          )}

          <div className="flex justify-center gap-4">
            <a
              href={`/${role}/tasks`}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
              Back to Tasks
            </a>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              onClick={() => window.location.reload()}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
