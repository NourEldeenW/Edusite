// app/(main)/tasks/[taskID]/submissions/[sID]/page.tsx
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { djangoApi } from "@/lib/axiosinterceptor";
import { formatUserDate } from "@/lib/formatDate";
import SubmissionViewer from "./_reviewcomps/SubmissionViewer";
import GradingSection from "./_reviewcomps/GradingSection";
import ErrorPage from "./_reviewcomps/errorpag";
import { GradeType } from "@/app/(main)/(common pages)/students/_students comps/main";

export const metadata: Metadata = {
  title: "EduTrack | Task Review",
  description: "Review a task submission",
};

type task_content_type = "text" | "pdf";
type submission_type = "text" | "pdf" | "both";
type submission_policy = "single";
type status = "not_started" | "in_progress" | "submitted" | "corrected";

export interface submission_detail {
  id: number;
  task: {
    id: number;
    teacher: number;
    teacher_name: string;
    grade: GradeType;
    centers: Array<{
      center: GradeType;
      open_date: string;
      close_date: string;
    }>;
    title: string;
    details: string;
    task_content_type: task_content_type;
    task_text: string;
    task_pdf: string;
    submission_type: submission_type;
    submission_policy: submission_policy;
    timer_minutes: number;
    max_score: number;
    created_at: string;
  };
  student: {
    id: number;
    student_id: string;
    full_name: string;
    phone_number: string;
    parent_number: string;
    center: {
      id: number;
      name: string;
    };
    grade: {
      id: number;
      name: string;
    };
  };
  status: status;
  start_time: string;
  end_time: string;
  submitted_text: string;
  submitted_pdf: string;
  score: number | null;
  feedback: string;
  corrected_at: string | null;
  corrected_by: string | null;
}

export default async function TReview({
  params,
}: {
  params: Promise<{ taskID: string; sID: string }>;
}) {
  const [headerData, paramsData] = await Promise.all([headers(), params]);
  const role = headerData.get("x-user-role") || "";
  const acces = headerData.get("access");
  const { taskID, sID } = paramsData;

  if (!acces) return redirect("/login");

  // Students should be able to view their submissions
  if (role !== "teacher" && role !== "assistant" && role !== "student") {
    return redirect(`/${role}/dashboard`);
  }
  try {
    const response = await fetch(
      `${djangoApi}task/tasks/${taskID}/submissions/${sID}/`,
      {
        headers: {
          Authorization: `Bearer ${acces}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 403) {
        return (
          <ErrorPage
            title="Access Denied"
            message="You don't have permission to view this submission."
            role={role}
          />
        );
      }
      if (response.status === 404) {
        return (
          <ErrorPage
            title="Submission Not Found"
            message="The requested submission doesn't exist or has been deleted."
            role={role}
          />
        );
      }
      throw new Error(`Failed to fetch submission: ${response.status}`);
    }

    const submissionDetail: submission_detail = await response.json();

    // Calculate time taken from start_time and end_time
    const startTime = new Date(submissionDetail.start_time);
    const endTime = new Date(submissionDetail.end_time);
    const diffMs = endTime.getTime() - startTime.getTime();
    const hours = Math.floor(diffMs / 3600000);
    const minutes = Math.floor((diffMs % 3600000) / 60000);
    const timeTaken = submissionDetail.end_time
      ? `${hours} hour${hours !== 1 ? "s" : ""} ${minutes} minute${
          minutes !== 1 ? "s" : ""
        }`
      : `${submissionDetail.task.timer_minutes} minute${
          submissionDetail.task.timer_minutes !== 1 ? "s" : ""
        }`;

    // Format submission date
    const submittedOn = submissionDetail.end_time
      ? formatUserDate(submissionDetail.end_time)
      : null;

    const link = role === "student" ? `/student/tasks` : "/tasks";

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Main Content */}
        <div className="">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div className="mb-4 md:mb-0">
              <h1 className="text-3xl font-bold text-gray-900 bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Submission Review
              </h1>
              <p className="text-gray-600 mt-2">
                {role === "student"
                  ? "View your submission and feedback"
                  : "Review student work and provide feedback"}
              </p>
            </div>
            <a
              href={link}
              className="inline-flex items-center px-4 py-2.5 bg-white border border-gray-200 rounded-lg shadow-sm text-gray-700 hover:bg-gray-50 hover:shadow-md transition-all duration-200 ease-in-out w-fit">
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to {role === "student" ? "Tasks" : "Submissions"}
            </a>
          </div>

          {/* Grading Container */}
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
            {/* Left Panel - Submission Content */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Student Submission
                  </h2>
                  <StatusBadge
                    status={submissionDetail.status}
                    role={role}
                    correctedAt={submissionDetail.corrected_at}
                  />
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-4 shadow-md">
                      <span className="text-white font-semibold text-lg">
                        {getInitials(submissionDetail.student.full_name)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {submissionDetail.student.full_name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {submissionDetail.student.grade.name} • Student ID:{" "}
                      {submissionDetail.student.student_id}
                    </p>
                    <p className="text-sm text-gray-500">
                      {submissionDetail.student.center.name}
                    </p>
                  </div>
                </div>

                {/* Submission Content */}

                <SubmissionViewer
                  text={submissionDetail.submitted_text}
                  pdf={submissionDetail.submitted_pdf}
                  role={role}
                />
              </div>
            </div>

            {/* Right Panel - Grading Section */}
            <GradingSection
              taskID={Number(taskID)}
              sID={Number(sID)}
              submissionDetail={submissionDetail}
              timeTaken={timeTaken}
              submittedOn={submittedOn ?? "Late Submission (No Time)"}
              role={role}
              access={acces}
            />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <ErrorPage
        title="Something Went Wrong"
        message="We encountered an error while loading this submission. Please try again later."
        role={role}
        error={error instanceof Error ? error.message : "Unknown error"}
      />
    );
  }
}

// Helper functions
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getStatusLabel(status: status, correctedAt: string | null): string {
  switch (status) {
    case "submitted":
      return "Submitted";
    case "corrected":
      return correctedAt
        ? `Graded on ${formatUserDate(correctedAt)}`
        : "Graded";
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

// Status Badge Component
function StatusBadge({
  status,
  correctedAt,
}: {
  status: status;
  role: string;
  correctedAt: string | null;
}) {
  const statusColors = {
    submitted: "bg-blue-100 text-blue-800 border border-blue-200",
    corrected: "bg-green-100 text-green-800 border border-green-200",
    not_started: "bg-gray-100 text-gray-800 border border-gray-200",
    in_progress: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  };

  const statusIcons = {
    submitted: (
      <svg
        className="w-4 h-4 mr-1.5"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg">
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    ),
    corrected: (
      <svg
        className="w-4 h-4 mr-1.5"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg">
        <path
          fillRule="evenodd"
          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    ),
    not_started: (
      <svg
        className="w-4 h-4 mr-1.5"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
          clipRule="evenodd"
        />
      </svg>
    ),
    in_progress: (
      <svg
        className="w-4 h-4 mr-1.5"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
          clipRule="evenodd"
        />
      </svg>
    ),
  };

  return (
    <div
      className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${statusColors[status]}`}>
      {statusIcons[status]}
      {getStatusLabel(status, correctedAt)}
    </div>
  );
}
