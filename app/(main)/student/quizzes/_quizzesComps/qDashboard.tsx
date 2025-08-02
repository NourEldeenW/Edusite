import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton"; // Import skeleton component
import useAllQuizzes from "@/lib/stores/student/quizzes/allQuizzes";
import { AlertCircle, BookOpen, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const getStatusClass = (status: string) => {
  switch (status) {
    case "open":
      return "bg-green-100 text-green-800";
    case "upcoming":
      return "bg-yellow-100 text-yellow-800";
    case "closed":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function QDashboard({
  isLoading,
  error,
}: {
  isLoading: boolean;
  error: string | null;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const allQuizzes = useAllQuizzes.getState().allQuizzes;
  const router = useRouter();

  const resetFilters = () => {
    setSearchQuery("");
  };

  const filteredQuizzes = useMemo(() => {
    return allQuizzes.filter((quiz) => {
      return quiz.title.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [allQuizzes, searchQuery]);

  // Loading State - Skeleton Loaders
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="header flex justify-between items-center flex-wrap gap-4 mb-8">
          <Skeleton className="h-8 w-64" />
        </div>

        {/* Filter Skeleton */}
        <div className="w-full bg-bg-secondary p-4 rounded-xl border border-border-default flex flex-col md:flex-row gap-6 mb-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>

        {/* Quiz Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-bg-secondary rounded-xl overflow-hidden shadow-sm border border-border-default flex flex-col">
              {/* Header Skeleton */}
              <div className="p-5 pb-4 border-b border-border-default flex-1">
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-6 w-6 rounded-full" />
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>

                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              </div>

              {/* Details Skeleton */}
              <div className="p-4 bg-gray-50 border-t border-border-default space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>

              {/* Button Skeleton */}
              <div className="p-4">
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="p-6">
        <div className="header flex justify-between items-center flex-wrap gap-4 mb-8">
          <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
            Quizzes Dashboard
          </h1>
        </div>

        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading quizzes</AlertTitle>
          <AlertDescription>
            {error}
            <Button
              variant="link"
              className="ml-2 p-0 h-auto"
              onClick={() => window.location.reload()}>
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <div className="header flex justify-between items-center flex-wrap gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
            Quizzes Dashboard
          </h1>
        </div>
      </div>

      <div className="w-full bg-bg-secondary p-4 rounded-xl border border-border-default flex flex-col md:flex-row gap-6 mb-6">
        <div className="flex-grow">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by quiz title..."
            className="w-full"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex flex-wrap gap-3 w-full">
            <Button
              variant="secondary"
              onClick={resetFilters}
              className="flex items-center w-fit rounded-full"
              aria-label="Reset filter">
              <X size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Quiz Grid */}
      {filteredQuizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => {
            const centerTime = quiz.center_times[0];
            const isUpcoming = centerTime.status === "upcoming";
            const isOpen = centerTime.status === "open";
            const isClosed = centerTime.status === "closed";

            // Enhanced button logic
            let buttonText = "";
            let buttonVariant:
              | "default"
              | "outline"
              | "destructive"
              | "secondary"
              | "ghost"
              | "link" = "outline";
            let isDisabled = false;
            let buttonClass =
              "flex-1 transition-colors hover:text-text-inverse";

            if (isUpcoming) {
              buttonText = "Unavailable yet!";
              isDisabled = true;
              buttonClass += " text-gray-500 bg-gray-100";
            } else if (isOpen) {
              if (quiz.student_quiz_status === "not_started") {
                buttonText = "Start Quiz";
                buttonVariant = "default";
                buttonClass += " bg-green-600 hover:bg-green-700 text-white";
              } else if (quiz.student_quiz_status === "in_progress") {
                buttonText = "Continue Quiz";
                buttonClass += " bg-blue-600 hover:bg-blue-700 text-white";
              } else {
                // submitted
                buttonText = "View Submission";
              }
            } else if (isClosed) {
              if (quiz.student_quiz_status === "not_started") {
                buttonText = "Missed!";
                isDisabled = true;
                buttonClass += " text-gray-500 bg-gray-100";
              } else if (quiz.student_quiz_status === "in_progress") {
                buttonText = "Continue Quiz";
                buttonClass += " bg-blue-600 hover:bg-blue-700 text-white";
              } else {
                // submitted
                buttonText = "View Submission";
              }
            }
            return (
              <div
                key={quiz.id}
                className="bg-bg-secondary rounded-xl overflow-hidden shadow-sm border border-border-default transition-all duration-300 flex flex-col hover:-translate-y-1 hover:shadow-lg">
                <div className="quiz-header p-5 pb-4 border-b border-border-default flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="quiz-title text-xl font-semibold">
                      {quiz.title}
                    </h2>
                  </div>
                  <div className="quiz-meta flex flex-wrap gap-2 mb-3">
                    {quiz.grade && (
                      <span className="quiz-tag grade-tag inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {quiz.grade.name}
                      </span>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {quiz.center_times.map((ct) => {
                        return (
                          <span
                            key={ct.center.id}
                            className="quiz-tag center-tag inline-block px-3 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-800 truncate max-w-[120px]"
                            title={`${ct.center.name}: ${formatDate(
                              ct.open_date
                            )} - ${formatDate(ct.close_date)}`}>
                            {ct.center.name}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <p className="quiz-description text-text-secondary text-sm leading-normal mb-4">
                    {quiz.description || "No description available"}
                  </p>
                </div>

                <div className="quiz-details p-4 bg-gray-50 border-t border-border-default">
                  {quiz.center_times.map((ct, index) => (
                    <div
                      key={ct.center.id}
                      className={`pb-4 ${
                        index !== quiz.center_times.length - 1
                          ? "border-b border-gray-200 mb-4"
                          : "pb-0"
                      }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">
                          {ct.center.name}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-sm text-xs font-medium ${getStatusClass(
                            ct.status
                          )}`}>
                          {ct.status.charAt(0).toUpperCase() +
                            ct.status.slice(1)}
                        </span>
                      </div>
                      <div className="quiz-detail flex justify-between text-sm mb-1">
                        <span className="detail-label text-text-secondary">
                          Opens:
                        </span>
                        <span className="detail-value font-medium">
                          {ct.open_date ? formatDate(ct.open_date) : "No date"}
                        </span>
                      </div>
                      <div className="quiz-detail flex justify-between text-sm">
                        <span className="detail-label text-text-secondary">
                          Closes:
                        </span>
                        <span className="detail-value font-medium">
                          {ct.close_date
                            ? formatDate(ct.close_date)
                            : "No date"}
                        </span>
                      </div>
                    </div>
                  ))}

                  <div className="quiz-detail flex justify-between text-sm mt-4 pt-4 border-t border-gray-200">
                    <span className="detail-label text-text-secondary">
                      Questions:
                    </span>
                    <span className="detail-value font-medium">
                      {quiz.question_count}
                    </span>
                  </div>
                </div>

                <div className="quiz-actions p-4 flex gap-3">
                  <Button
                    variant={buttonVariant}
                    disabled={isDisabled}
                    onClick={() => {
                      switch (buttonText) {
                        case "View Submission":
                          router.push(
                            `/quizzes/${quiz.id}/review/${quiz.submission_id}`
                          );
                          break;
                        case "Start Quiz":
                        case "Continue Quiz":
                          router.push(`/quizzes/${quiz.id}`);
                          break;
                      }
                    }}
                    className={buttonClass}>
                    {buttonText}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <BookOpen className="w-16 h-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No quizzes found
          </h3>
          <p className="text-gray-500 text-center max-w-md">
            Try adjusting your filters.
          </p>
        </div>
      )}
    </>
  );
}
