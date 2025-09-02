import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { djangoApi } from "@/lib/axiosinterceptor";
import { GradeType } from "@/app/(main)/(common pages)/students/_students comps/main";
import Main from "./_takeTaskComp/main";

export const metadata: Metadata = {
  title: "EduTrack | Take Task",
  description: "Take Task page for EduTrack",
};

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

export default async function page({
  params,
  searchParams,
}: {
  params: Promise<{ taskID: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [{ taskID }, headerData, searchParam] = await Promise.all([
    params,
    headers(),
    searchParams,
  ]);
  const role = headerData.get("x-user-role");

  if (role !== "student") return redirect(`/${role}/dashboard`);
  const access = headerData.get("access");
  if (!access) return redirect("/login");

  const sub = await fetch(
    `${djangoApi}task/tasks/${taskID}/submissions/${searchParam.subId}/`,
    {
      headers: {
        Authorization: `Bearer ${access}`,
      },
    }
  );

  switch (sub.status) {
    case 200:
      const data: Submission = await sub.json();
      if (data.status === "corrected" || data.status === "submitted")
        redirect(`/tasks/${taskID}/review/${searchParam.subId}`);
      else if (data.status === "not_started") {
        redirect("/student/tasks/");
      }

      return <Main submission={data} access={access} />;

    case 403:
      return <p>unauthorized</p>;

    case 404:
      return <p>task not found</p>;
    default:
      return <p>something went wrong</p>;
  }
}
