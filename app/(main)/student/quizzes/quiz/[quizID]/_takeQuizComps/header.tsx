import { formatUserDate } from "@/lib/formatDate";
import useTakeQuizStore from "@/lib/stores/student/quizzes/takeQuiz";
import { useEffect, useState } from "react";

function formatTime(seconds: number): string {
  if (isNaN(seconds)) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

// Mock icons - in a real app you'd import from an icon library
const CalendarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4 mr-2"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const ClockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4 mr-2"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

export default function Header() {
  const quizData = useTakeQuizStore((state) => state.quizData);
  const timer = useTakeQuizStore((state) => state.timer);
  const [timeLow, setTimeLow] = useState(false);

  // Determine if quiz has time limit
  const hasTimeLimit = (quizData?.settings?.timer_minutes ?? 0) > 0;

  // Update timeLow state when time is critical
  useEffect(() => {
    if (hasTimeLimit && timer && timer <= 300) {
      setTimeLow(true);
    } else {
      setTimeLow(false);
    }
  }, [timer, hasTimeLimit]);

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl shadow-lg p-6 mb-8 border border-indigo-100 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200 rounded-full opacity-10 -mt-16 -mr-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-200 rounded-full opacity-10 -mb-12 -ml-12"></div>

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">
                {quizData?.title}
              </h1>
              <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {quizData?.grade.name}
              </span>
            </div>

            <p className="text-gray-600 mt-2 max-w-3xl">
              {quizData?.description}
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="flex items-center text-sm bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                <CalendarIcon />
                <div>
                  <div className="text-xs text-gray-500 font-medium">
                    Open Date
                  </div>
                  <div className="font-medium text-gray-800">
                    {quizData?.center_times?.[0]?.open_date
                      ? formatUserDate(quizData.center_times[0].open_date)
                      : "N/A"}
                  </div>
                </div>
              </div>

              <div className="flex items-center text-sm bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                <CalendarIcon />
                <div>
                  <div className="text-xs text-gray-500 font-medium">
                    Close Date
                  </div>
                  <div className="font-medium text-gray-800">
                    {quizData?.center_times?.[0]?.close_date
                      ? formatUserDate(quizData.center_times[0].close_date)
                      : "N/A"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timer Section - handles both timed and untimed quizzes */}
          <div className="w-full md:w-auto flex-shrink-0">
            {hasTimeLimit ? (
              <div className={`${timeLow ? "animate-pulse" : ""}`}>
                <div
                  className={`flex flex-col items-center justify-center rounded-xl p-4 transition-all duration-300 ${
                    timer && timer <= 60
                      ? "bg-red-50 border-2 border-red-200 text-red-700"
                      : timeLow
                      ? "bg-amber-50 border-2 border-amber-200 text-amber-700"
                      : "bg-indigo-50 border-2 border-indigo-200 text-indigo-700"
                  }`}>
                  <div className="flex items-center text-sm font-medium mb-1">
                    <ClockIcon />
                    <span>TIME REMAINING</span>
                  </div>
                  <div
                    className={`text-3xl font-bold tracking-wider ${
                      timer && timer <= 60
                        ? "text-red-600"
                        : timeLow
                        ? "text-amber-600"
                        : "text-indigo-600"
                    }`}>
                    {timer ? formatTime(timer) : "00:00"}
                  </div>
                  {timeLow && (
                    <div className="text-xs font-medium mt-1">
                      {timer && timer <= 60
                        ? "HURRY! Time is almost up!"
                        : "Time is running out!"}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // No time limit UI
              <div className="flex flex-col items-center justify-center rounded-xl p-4 bg-green-50 border-2 border-green-200 text-green-700">
                <div className="flex items-center text-sm font-medium mb-1">
                  <ClockIcon />
                  <span>TIME STATUS</span>
                </div>
                <div className="text-3xl font-bold tracking-wider text-green-600">
                  No Limit
                </div>
                <div className="text-xs font-medium mt-1">Take your time</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
