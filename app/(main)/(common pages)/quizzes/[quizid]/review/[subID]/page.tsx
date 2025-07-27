import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { Metadata } from "next";
import { Suspense } from "react";
import LoadingSpinner from "./_reviewcomps/loading-spinner";
import ErrorPage from "./_reviewcomps/errorPage";
import Headers from "./_reviewcomps/headers";
import { formatUserDate } from "@/lib/formatDate";
import AnswersAndScores from "./_reviewcomps/A&S";

interface apiDataType {
  id: number;
  quiz_title: string;
  quiz_description: string;
  student_id: string;
  student_name: string;
  center: {
    id: number;
    name: string;
    teacher: number;
  };
  grade: {
    id: number;
    name: string;
  };
  start_time: string;
  end_time: string;
  score: string;
  is_submitted: boolean;
  time_taken: string;
  answers: [
    {
      id: number;
      question: {
        id: number;
        text: string;
        image: null | string;
      };
      selection_type: "single" | "multiple";
      choices: [
        {
          id: number;
          text: string;
          image: null | string;
          is_correct: boolean;
        }
      ];
      selected_choices: [
        {
          id: number;
          text: string;
          image: null | string;
          is_correct: boolean;
        }
      ];
      is_correct: boolean;
      points_earned: number;
    }
  ];
  submission_status: "on_time" | "late";
  is_score_released: boolean;
  are_answers_released: boolean;
}

export const metadata: Metadata = {
  title: "EduSite | Quiz Review",
  description: "Review your quiz performance and answers on EduSite.",
};

const djangoAPI = process.env.NEXT_PUBLIC_DJANGO_BASE_URL;

async function fetchSubmissionData(
  quizid: string,
  subID: string,
  access: string
) {
  const response = await fetch(
    `${djangoAPI}onlinequiz/quizzes/${quizid}/submissions/${subID}/`,
    {
      headers: {
        Authorization: `Bearer ${access}`,
        "Content-Type": "application/json",
      },
      next: { revalidate: 0 },
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      notFound();
    }
    throw new Error(`Failed to fetch submission data: ${response.status}`);
  }

  return await response.json();
}

async function SubmissionReviewContent({
  quizid,
  subID,
}: {
  quizid: string;
  subID: string;
}) {
  const headerData = await headers();
  const role = headerData.get("x-user-role");
  const access = headerData.get("access");

  if (!["teacher", "assistant", "student"].includes(role || "")) {
    redirect(`/${role || "user"}/dashboard`);
  }

  if (!access) {
    redirect("/login");
  }

  try {
    const submissionData: apiDataType = await fetchSubmissionData(
      quizid,
      subID,
      access
    );

    const data = {
      studentID: submissionData.student_id,
      student_name: submissionData.student_name,
      start_time: formatUserDate(submissionData.start_time),
      end_time: formatUserDate(submissionData.end_time),
      center: submissionData.center.name,
      quiz_title: submissionData.quiz_title,
      desc: submissionData.quiz_description,
      score:
        role === "teacher" || role === "assistant"
          ? submissionData.score
          : submissionData.is_score_released
          ? submissionData.score
          : null,
      timeTaken: submissionData.time_taken,
      submission_status: submissionData.submission_status,
    };

    if (role === "teacher" || role === "assistant") {
      // Create a modified copy instead of mutating original
      const modifiedData = {
        ...submissionData,
        is_score_released: true,
        are_answers_released: true,
      };
      return (
        <>
          <Headers {...data} />
          <AnswersAndScores data={modifiedData} />
        </>
      );
    }

    return (
      <>
        <Headers {...data} />
        <AnswersAndScores data={submissionData} />
      </>
    );
  } catch {
    return <ErrorPage />;
  }
}

export default async function MainPage({
  params,
}: {
  params: Promise<{ quizid: string; subID: string }>;
}) {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <SubmissionReviewContent
        quizid={(await params).quizid}
        subID={(await params).subID}
      />
    </Suspense>
  );
}

function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <LoadingSpinner className="h-12 w-12 text-primary" />
      <p className="mt-4 text-lg">Loading submission details...</p>
    </div>
  );
}
