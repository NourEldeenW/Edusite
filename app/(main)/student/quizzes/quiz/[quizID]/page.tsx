// File: app/student/quizzes/[quizid]/page.tsx
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import TakeQuiz from "./_takeQuizComps/main";

export const metadata: Metadata = {
  title: "EduTrack | Take Quiz",
  description: "Student quiz-taking interface",
};

export default async function MainPage({
  params,
}: {
  params: Promise<{ quizID: string }>; // Updated type to Promise
}) {
  // Await the params object before accessing its properties
  const { quizID } = await params;

  const headerData = await headers();
  const role = headerData.get("x-user-role");
  if (role !== "student") return redirect(`/${role}/dashboard`);

  const access = headerData.get("access");
  if (!access) return redirect("/login");

  return <TakeQuiz access={access} quizId={quizID} />;
}
