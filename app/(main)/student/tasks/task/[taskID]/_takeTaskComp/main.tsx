"use client";

import { useTakeTaskStore } from "@/lib/stores/student/tasks/takeTask";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GradeType } from "@/app/(main)/(common pages)/students/_students comps/main";
import ConfirmationModal from "./ConfirmationModal";

function formatTime(seconds: number): string {
  if (isNaN(seconds)) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

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

interface TaskCenter {
  center: GradeType;
  open_date: string;
  close_date: string;
}

interface TaskDetails {
  id: number;
  teacher: number;
  teacher_name: string;
  grade: GradeType;
  centers: TaskCenter[];
  title: string;
  details: string;
  task_content_type: "text" | "pdf";
  task_text?: string;
  task_pdf?: string;
  submission_type: "text" | "pdf" | "both";
  submission_policy: "single";
  timer_minutes: number;
  max_score: number;
  created_at: string;
}

interface Student {
  id: number;
  student_id: string;
  full_name: string;
  phone_number: string;
  parent_number: string;
  center: GradeType;
  grade: GradeType;
}

interface Submission {
  id: number;
  task: TaskDetails;
  student: Student;
  status: "not_started" | "in_progress" | "submitted" | "corrected";
  start_time: string;
  end_time: string;
  submitted_text?: string;
  submitted_pdf?: string;
  score?: number;
  feedback?: string;
  corrected_at?: string;
  corrected_by?: string;
}

export default function Main({
  access,
  submission,
}: {
  access: string;
  submission: Submission;
}) {
  const router = useRouter();
  const setAccess = useTakeTaskStore((state) => state.setAccessToken);
  const setTask = useTakeTaskStore((state) => state.setTask);
  const taskData = useTakeTaskStore((state) => state.taskData);
  const textAnswer = useTakeTaskStore((state) => state.textAnswer);
  const setTextAnswer = useTakeTaskStore((state) => state.setTextAnswer);
  const fileAnswer = useTakeTaskStore((state) => state.fileAnswer);
  const setFileAnswer = useTakeTaskStore((state) => state.setFileAnswer);
  const persistedFileName = useTakeTaskStore(
    (state) => state.persistedFileName
  );
  const timer = useTakeTaskStore((state) => state.timer);
  const isTimed = useTakeTaskStore((state) => state.isTimed);
  const loading = useTakeTaskStore((state) => state.loading);
  const error = useTakeTaskStore((state) => state.error);
  const submitTask = useTakeTaskStore((state) => state.submitTask);
  const submissionCompleted = useTakeTaskStore(
    (state) => state.submissionCompleted
  );
  const [timeLow, setTimeLow] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [validationError, setValidationError] = useState("");

  // Initialize store
  useEffect(() => {
    setAccess(access);
    setTask(submission);
  }, [access, submission, setAccess, setTask]);

  // Handle redirection after successful submission
  useEffect(() => {
    if (submissionCompleted) {
      router.push(
        `/tasks/${submissionCompleted.taskId}/review/${submissionCompleted.submissionId}`
      );
    }
  }, [submissionCompleted, router]);

  // Calculate word count
  useEffect(() => {
    if (textAnswer) {
      const words = textAnswer.trim().split(/\s+/);
      setWordCount(words.length > 0 ? words.length : 0);
    } else {
      setWordCount(0);
    }
  }, [textAnswer]);

  // Time warning logic
  useEffect(() => {
    if (isTimed && timer && timer <= 300) {
      setTimeLow(true);
    } else {
      setTimeLow(false);
    }
  }, [timer, isTimed]);

  // Handle text input with paste/copy prevention
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextAnswer(e.target.value);
    setValidationError("");
  };

  // Prevent copy/paste/cut
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    setValidationError("Copy/paste is not allowed");
  };

  const handleCopy = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    setValidationError("Copying is not allowed");
  };

  const handleCut = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    setValidationError("Cutting is not allowed");
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileAnswer(e.target.files[0]);
      setValidationError("");
    }
  };

  // Handle submission
  const handleSubmit = () => {
    // Ensure taskData is not null before proceeding
    if (!taskData) {
      setValidationError("Task data is not loaded.");
      return;
    }
    // Validate based on submission type
    const { submission_type } = taskData.task;

    if (submission_type === "text" && !textAnswer.trim()) {
      setValidationError("Text answer is required");
      return;
    }

    if (submission_type === "pdf" && !fileAnswer) {
      setValidationError("PDF file is required");
      return;
    }

    if (submission_type === "both" && (!textAnswer.trim() || !fileAnswer)) {
      setValidationError("Both text answer and PDF file are required");
      return;
    }

    setShowConfirmation(true);
  };

  const confirmSubmit = () => {
    setShowConfirmation(false);
    submitTask();
  };

  if (!taskData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading task...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl shadow-lg p-6 mb-8 border border-indigo-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200 rounded-full opacity-10 -mt-16 -mr-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-200 rounded-full opacity-10 -mb-12 -ml-12"></div>

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">
                    {taskData.task.title}
                  </h1>
                  <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    {taskData.task.grade.name}
                  </span>
                </div>

                <p className="text-gray-600 mt-2 max-w-3xl">
                  {taskData.task.details}
                </p>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="flex items-center text-sm bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                    <CalendarIcon />
                    <div>
                      <div className="text-xs text-gray-500 font-medium">
                        Open Date
                      </div>
                      <div className="font-medium text-gray-800">
                        {new Date(
                          taskData.task.centers[0].open_date
                        ).toLocaleDateString()}
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
                        {new Date(
                          taskData.task.centers[0].close_date
                        ).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center text-sm bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                    <div>
                      <div className="text-xs text-gray-500 font-medium">
                        Submission Type
                      </div>
                      <div className="font-medium text-gray-800 capitalize">
                        {taskData.task.submission_type}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timer Section */}
              <div className="w-full md:w-auto flex-shrink-0">
                {isTimed ? (
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
                  <div className="flex flex-col items-center justify-center rounded-xl p-4 bg-green-50 border-2 border-green-200 text-green-700">
                    <div className="flex items-center text-sm font-medium mb-1">
                      <ClockIcon />
                      <span>TIME STATUS</span>
                    </div>
                    <div className="text-3xl font-bold tracking-wider text-green-600">
                      No Limit
                    </div>
                    <div className="text-xs font-medium mt-1">
                      Take your time
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Task Content */}
        {taskData.task.task_content_type && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <h2 className="text-xl font-semibold text-gray-800">
                Task Content
              </h2>
            </div>
            <div className="p-6">
              {taskData.task.task_content_type === "text" &&
                taskData.task.task_text && (
                  <div className="prose max-w-none p-4 bg-gray-50 rounded-lg border border-gray-200">
                    {taskData.task.task_text}
                  </div>
                )}
              {taskData.task.task_content_type === "pdf" &&
                taskData.task.task_pdf && (
                  <div className="h-96">
                    <iframe
                      src={taskData.task.task_pdf}
                      className="w-full h-full"
                      title="Task PDF"
                    />
                  </div>
                )}
            </div>
          </div>
        )}

        {/* Submission Form */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <h2 className="text-xl font-semibold text-gray-800">
              Your Submission
            </h2>
          </div>
          <div className="p-6 space-y-6">
            {/* Text Submission */}
            {(taskData.task.submission_type === "text" ||
              taskData.task.submission_type === "both") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text Answer
                </label>
                <textarea
                  value={textAnswer}
                  onChange={handleTextChange}
                  onPaste={handlePaste}
                  onCopy={handleCopy}
                  onCut={handleCut}
                  spellCheck={false}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors h-40 resize-none"
                  placeholder="Type your answer here..."
                />
                <div className="text-sm text-gray-500 mt-2">
                  Word count: {wordCount}
                </div>
              </div>
            )}

            {/* File Submission */}
            {(taskData.task.submission_type === "pdf" ||
              taskData.task.submission_type === "both") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File Upload
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {persistedFileName && !fileAnswer && (
                  <div className="text-sm text-amber-600 mt-2">
                    Previously uploaded file: {persistedFileName}. Please
                    re-upload if you want to submit it.
                  </div>
                )}
                {fileAnswer && (
                  <div className="text-sm text-green-600 mt-2">
                    Selected file: {fileAnswer.name}
                  </div>
                )}
              </div>
            )}

            {/* Error Display */}
            {(error || validationError) && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {error || validationError}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md font-medium">
              {loading ? (
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
                  Submitting...
                </>
              ) : (
                "Submit Task"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={confirmSubmit}
        taskData={taskData}
        textAnswer={textAnswer}
        fileAnswer={fileAnswer}
        timeLow={timeLow}
      />
    </div>
  );
}
