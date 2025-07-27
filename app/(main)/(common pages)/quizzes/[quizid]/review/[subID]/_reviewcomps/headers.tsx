"use client";

import { Button } from "@/components/ui/button";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faArrowLeft,
  faChartLine,
  faFilePen,
  faUser,
  faCalendarCheck,
  faCalendarXmark,
  faHourglassHalf,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import clsx from "clsx";

interface propsType {
  studentID: string;
  student_name: string;
  start_time: string;
  end_time: string;
  center: string;
  quiz_title: string;
  desc: string;
  score: string | null;
  timeTaken: string;
  submission_status: "on_time" | "late";
}

// --- Helper Functions ---

/**
 * Converts a fraction string (e.g., "8/10") to a formatted percentage string.
 * @param fractionStr The fraction string.
 * @param decimals The number of decimal places.
 * @returns The formatted percentage string (e.g., "80.0%") or "N/A".
 */
function fractionToPercentage(fractionStr: string, decimals = 2) {
  if (!fractionStr || !fractionStr.includes("/")) {
    return "N/A";
  }
  const parts = fractionStr.split("/");
  if (parts.length !== 2) {
    return "N/A";
  }
  const numerator = parseFloat(parts[0].trim());
  const denominator = parseFloat(parts[1].trim());
  if (isNaN(numerator) || isNaN(denominator) || denominator === 0) {
    return "N/A";
  }
  const fraction = numerator / denominator;
  const percent = fraction * 100;
  return `${percent.toFixed(decimals)}%`;
}

/**
 * Converts a fraction string to its numeric percentage value.
 * @param fractionStr The fraction string (e.g., "8/10").
 * @returns The numeric percentage (e.g., 80) or null if invalid.
 */
function getNumericPercentage(fractionStr: string | null): number | null {
  if (!fractionStr || !fractionStr.includes("/")) {
    return null;
  }
  const parts = fractionStr.split("/");
  if (parts.length !== 2) {
    return null;
  }
  const numerator = parseFloat(parts[0].trim());
  const denominator = parseFloat(parts[1].trim());
  if (isNaN(numerator) || isNaN(denominator) || denominator === 0) {
    return null;
  }
  return (numerator / denominator) * 100;
}

function formatDateTime(dateString: string) {
  try {
    return format(new Date(dateString), "MMM dd, yyyy, hh:mm a");
  } catch {
    return "Invalid Date";
  }
}

// --- Reusable Info Card Component for the bottom section ---
const InfoCard = ({
  icon,
  label,
  value,
  iconClassName,
}: {
  icon: IconDefinition;
  label: string;
  value: React.ReactNode;
  iconClassName?: string;
}) => (
  <div className="flex items-center gap-4 bg-slate-50 rounded-lg p-4 border border-slate-200 hover:shadow-lg hover:border-primary/30 transition-all duration-300">
    <FontAwesomeIcon
      icon={icon}
      className={clsx("h-6 w-6 text-primary/70", iconClassName)}
    />
    <div>
      <p className="text-sm text-slate-500 font-medium">{label}</p>
      <div className="text-base font-semibold text-slate-800">{value}</div>
    </div>
  </div>
);

// --- Enhanced Main Component ---
export default function Headers(data: propsType) {
  const router = useRouter();

  const isOnTime = data.submission_status === "on_time";
  const numericScore = getNumericPercentage(data.score);

  // Determine performance card styling based on score
  const performanceStyles = {
    container: "bg-slate-50 border-slate-200",
    iconContainer: "bg-slate-200/80",
    icon: "text-slate-600",
    headerText: "text-slate-700/80",
    scoreText: "text-slate-800",
    fractionText: "text-slate-700/70",
  };

  if (numericScore !== null) {
    if (numericScore >= 80) {
      // Success state
      performanceStyles.container = "bg-green-50 border-green-200";
      performanceStyles.iconContainer = "bg-green-200/80";
      performanceStyles.icon = "text-green-700";
      performanceStyles.headerText = "text-green-800/80";
      performanceStyles.scoreText = "text-green-700";
      performanceStyles.fractionText = "text-green-800/70";
    } else if (numericScore >= 50) {
      // Warning state
      performanceStyles.container = "bg-yellow-50 border-yellow-300";
      performanceStyles.iconContainer = "bg-yellow-200/80";
      performanceStyles.icon = "text-yellow-700";
      performanceStyles.headerText = "text-yellow-800/80";
      performanceStyles.scoreText = "text-yellow-700";
      performanceStyles.fractionText = "text-yellow-800/70";
    } else {
      // Error state
      performanceStyles.container = "bg-red-50 border-red-200";
      performanceStyles.iconContainer = "bg-red-200/80";
      performanceStyles.icon = "text-red-700";
      performanceStyles.headerText = "text-red-800/80";
      performanceStyles.scoreText = "text-red-700";
      performanceStyles.fractionText = "text-red-800/70";
    }
  }

  return (
    <div className="font-sans">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="flex items-center gap-2 text-primary hover:bg-primary/10 hover:text-primary-hover px-3 py-2 mb-6 rounded-lg transition-colors">
        <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
        Back to Quiz Details
      </Button>

      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-200 mx-auto">
        {/* Top Cards: Student, Quiz, Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student Card */}
          <div className="flex items-start gap-4 p-5 bg-slate-50 rounded-xl border border-slate-200 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex-shrink-0  items-center justify-center md:flex hidden">
              <FontAwesomeIcon icon={faUser} className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-medium text-slate-500">Student</h3>
              <p className="text-xl font-bold text-slate-800 mt-1">
                {data.student_name}
              </p>
              <div className="mt-2 text-sm text-slate-500 space-y-1">
                <p>ID: {data.studentID}</p>
                <p>Center: {data.center}</p>
              </div>
            </div>
          </div>

          {/* Quiz Card */}
          <div className="flex items-start gap-4 p-5 bg-slate-50 rounded-xl border border-slate-200 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex-shrink-0 items-center justify-center md:flex hidden">
              <FontAwesomeIcon
                icon={faFilePen}
                className="h-6 w-6 text-primary"
              />
            </div>
            <div>
              <h3 className="text-base font-medium text-slate-500">Quiz</h3>
              <p className="text-xl font-bold text-slate-800 mt-1">
                {data.quiz_title}
              </p>
              <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                {data.desc}
              </p>
            </div>
          </div>

          {/* Performance Card */}
          <div
            className={clsx(
              "flex items-start gap-4 p-5 rounded-xl border hover:shadow-md transition-all",
              performanceStyles.container
            )}>
            <div
              className={clsx(
                "w-14 h-14 rounded-full flex-shrink-0 items-center justify-center md:flex hidden",
                performanceStyles.iconContainer
              )}>
              <FontAwesomeIcon
                icon={faChartLine}
                className={clsx("h-6 w-6", performanceStyles.icon)}
              />
            </div>
            <div>
              <h3
                className={clsx(
                  "text-base font-medium",
                  performanceStyles.headerText
                )}>
                Performance
              </h3>
              {data.score ? (
                <div className="flex items-baseline gap-2 mt-1">
                  <p
                    className={clsx(
                      "text-4xl font-extrabold",
                      performanceStyles.scoreText
                    )}>
                    {fractionToPercentage(data.score, 1)}
                  </p>
                  <p
                    className={clsx(
                      "text-base font-medium",
                      performanceStyles.fractionText
                    )}>
                    ({data.score})
                  </p>
                </div>
              ) : (
                <p className="text-slate-500 font-semibold mt-2">
                  Score not yet released
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr className="my-8 border-slate-200" />

        {/* Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <InfoCard
            icon={faClock}
            label="Start Time"
            value={formatDateTime(data.start_time)}
          />
          <InfoCard
            icon={faClock}
            label="End Time"
            value={formatDateTime(data.end_time)}
          />
          <InfoCard
            icon={faHourglassHalf}
            label="Time Taken"
            value={data.timeTaken}
          />
          <InfoCard
            icon={isOnTime ? faCalendarCheck : faCalendarXmark}
            label="Submission"
            iconClassName={clsx({
              "text-green-600": isOnTime,
              "text-red-600": !isOnTime,
            })}
            value={
              <span
                className={clsx("font-bold", {
                  "text-green-600": isOnTime,
                  "text-red-600": !isOnTime,
                })}>
                {isOnTime ? "On Time" : "Late"}
              </span>
            }
          />
        </div>
      </div>
    </div>
  );
}
