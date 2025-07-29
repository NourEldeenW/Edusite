import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import StudentDashboard from "./_dashboardcomps/main";

export const metadata: Metadata = {
  title: "EduTrack | Dashboard",
  description:
    "This page is for teachers and assistants to manage and take attendance for sessions.",
};

export default async function dashboard() {
  const headerData = await headers();
  const role = headerData.get("x-user-role");
  if (role !== "student") return redirect(`/${role}/dashboard`);
  const access = headerData.get("access");
  if (!access) redirect("/login");

  return (
    <>
      <StudentDashboard access={access} />
    </>
  );
}
