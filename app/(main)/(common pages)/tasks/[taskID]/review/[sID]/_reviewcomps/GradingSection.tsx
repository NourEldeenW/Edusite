// app/(main)/tasks/[taskID]/submissions/[sID]/GradingSection.tsx
"use client";

import { formatUserDate } from "@/lib/formatDate";
import { useState, useEffect } from "react";
import { submission_detail } from "../page";
import { api, djangoApi } from "@/lib/axiosinterceptor";

interface GradingSectionProps {
  taskID: number;
  sID: number;
  submissionDetail: submission_detail;
  timeTaken: string;
  submittedOn: string;
  role: string;
  access: string;
}

export default function GradingSection({
  taskID,
  sID,
  submissionDetail,
  timeTaken,
  submittedOn,
  role,
  access,
}: GradingSectionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [isGraded, setIsGraded] = useState(
    submissionDetail.status === "corrected"
  );
  const [score, setScore] = useState<number | "">(submissionDetail.score ?? "");
  const [feedback, setFeedback] = useState(submissionDetail.feedback || "");

  // Update local state when submissionDetail changes (for initial load)
  useEffect(() => {
    setIsGraded(submissionDetail.status === "corrected");
    setScore(submissionDetail.score ?? "");
    setFeedback(submissionDetail.feedback || "");
  }, [submissionDetail]);

  const handleSubmitGrade = async () => {
    if (score === "" || score < 0 || score > submissionDetail.task.max_score) {
      showToastMessage("Error", "Please enter a valid score", "error");
      return;
    }

    setIsLoading(true);

    try {
      await api.patch(
        `${djangoApi}task/tasks/${taskID}/submissions/${sID}/`,
        {
          score,
          feedback,
        },
        {
          headers: {
            Authorization: `Bearer ${access}`,
          },
        }
      );

      // Update local state to reflect graded status
      setIsGraded(true);
      showToastMessage(
        "Success!",
        "Submission graded successfully!",
        "success"
      );
    } catch (error) {
      showToastMessage(
        "Error",
        error instanceof Error ? error.message : "Failed to submit grade",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const showToastMessage = (
    title: string,
    message: string,
    type: "success" | "error"
  ) => {
    setToastType(type);
    setToastMessage(message);
    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
    }, 5000);
  };

  // Render graded view for students or when submission is already graded
  if (role === "student") {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <h2 className="text-xl font-semibold text-gray-800">
            Submission Feedback
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {isGraded ? "Graded by instructor" : "Awaiting feedback"}
          </p>
        </div>

        <div className="p-6">
          {isGraded ? (
            <>
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 mb-6 border border-green-100">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                      <svg
                        className="w-6 h-6 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <span className="text-3xl font-bold text-gray-900">
                        {score}/{submissionDetail.task.max_score}
                      </span>
                      <span className="ml-3 px-3 py-1 bg-green-100 text-green-800 rounded-full font-medium text-sm">
                        {Math.round(
                          (Number(score) / submissionDetail.task.max_score) *
                            100
                        )}
                        %
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-gray-500 mb-4">
                  <svg
                    className="w-4 h-4 inline mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Graded on{" "}
                  {submissionDetail.corrected_at
                    ? formatUserDate(submissionDetail.corrected_at)
                    : "not graded yet"}
                </div>

                {feedback ? (
                  <div className="bg-white p-4 rounded-lg border border-gray-200 mt-4">
                    <h3 className="font-medium text-gray-700 mb-2 flex items-center">
                      <svg
                        className="w-4 h-4 mr-2 text-blue-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                        />
                      </svg>
                      Instructor Feedback
                    </h3>
                    <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {feedback}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500 italic">
                    No feedback provided.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-6 text-center">
              <div className="w-16 h-16 mx-auto bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Feedback Pending
              </h3>
              <p className="text-gray-600">
                Your instructor hasn&apos;t graded this submission yet.
              </p>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              Submission Details
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 flex items-center">
                  <svg
                    className="w-4 h-4 mr-2 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Submitted on
                </span>
                <span className="text-gray-800 font-medium">{submittedOn}</span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 flex items-center">
                  <svg
                    className="w-4 h-4 mr-2 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Time taken
                </span>
                <span className="text-gray-800 font-medium">{timeTaken}</span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 flex items-center">
                  <svg
                    className="w-4 h-4 mr-2 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  Task
                </span>
                <span className="text-gray-800 font-medium text-right max-w-xs">
                  {submissionDetail.task.title}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render grading form for teachers/assistants
  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <h2 className="text-xl font-semibold text-gray-800">
            Grade Submission
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Provide score and feedback
          </p>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label
              htmlFor="score"
              className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <svg
                className="w-4 h-4 mr-2 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Score
            </label>
            <div className="flex items-center">
              <input
                type="number"
                id="score"
                min="0"
                max={submissionDetail.task.max_score}
                step="0.5"
                placeholder={`Enter score (0-${submissionDetail.task.max_score})`}
                value={score}
                onChange={(e) => {
                  const value =
                    e.target.value === "" ? "" : Number(e.target.value);
                  if (
                    value === "" ||
                    (value >= 0 && value <= submissionDetail.task.max_score)
                  ) {
                    setScore(value);
                  }
                }}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
              <span className="ml-3 text-gray-600 font-medium">
                / {submissionDetail.task.max_score}
              </span>
            </div>
          </div>

          <div>
            <label
              htmlFor="feedback"
              className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <svg
                className="w-4 h-4 mr-2 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                />
              </svg>
              Feedback
            </label>
            <textarea
              id="feedback"
              placeholder="Provide detailed feedback for the student..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors h-40 resize-none"></textarea>
          </div>

          <div className="flex gap-3 pt-2">
            <button className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
              Cancel
            </button>
            <button
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 flex items-center transition-all duration-200 shadow-sm hover:shadow-md font-medium"
              onClick={handleSubmitGrade}
              disabled={isLoading}>
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Grading...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Submit Grade
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-4 pt-6 border-t border-gray-100 px-6 pb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            Submission Details
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600 flex items-center">
                <svg
                  className="w-4 h-4 mr-2 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Submitted on
              </span>
              <span className="text-gray-800 font-medium">{submittedOn}</span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600 flex items-center">
                <svg
                  className="w-4 h-4 mr-2 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Time taken
              </span>
              <span className="text-gray-800 font-medium">{timeTaken}</span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600 flex items-center">
                <svg
                  className="w-4 h-4 mr-2 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Task
              </span>
              <span className="text-gray-800 font-medium text-right max-w-xs">
                {submissionDetail.task.title}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <div
        className={`fixed top-6 right-6 p-4 rounded-lg shadow-lg transition-all duration-300 z-50 ${
          showToast
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        } ${
          toastType === "success"
            ? "bg-green-50 text-green-800 border border-green-200"
            : "bg-red-50 text-red-800 border border-red-200"
        }`}>
        <div className="flex items-start">
          <div
            className={`flex-shrink-0 rounded-full p-1 ${
              toastType === "success" ? "bg-green-100" : "bg-red-100"
            }`}>
            {toastType === "success" ? (
              <svg
                className="w-5 h-5 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 text-red-600"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
          <div className="ml-3">
            <p className="font-medium">
              {toastType === "success" ? "Success!" : "Error"}
            </p>
            <p className="mt-1 text-sm">{toastMessage}</p>
          </div>
          <button
            onClick={() => setShowToast(false)}
            className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-500 transition-colors">
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
