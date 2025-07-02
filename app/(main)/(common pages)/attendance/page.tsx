// app/(teacher)/studymaterials/page.tsx
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import AttendanceManagementPage from "./_attendancecomp/main";

export const metadata: Metadata = {
  title: "EduSite | Attendance",
  description:
    "This page is for teachers and assistants to manage and take attendance for sessions.",
};

export default async function page() {
  const headerData = await headers();
  const role = headerData.get("x-user-role");
  if (role !== "teacher" && role !== "assistant")
    return redirect(`/${role}/dashboard`);

  const access = headerData.get("access");
  if (!access) redirect("/login");

  return (
    <>
      <AttendanceManagementPage access={access} />
    </>
  );
}
