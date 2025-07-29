import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Mainpage from "./_studentscomp/mainpage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "EduTrack | Student Management",
  description: "Manage all student accounts and their academic information",
};

export default async function StudentManagement() {
  const headerData = await headers();
  const role = headerData.get("x-user-role");
  if (role !== "admin") return redirect(`/${role}/dashboard`);
  const access = headerData.get("access");
  if (!access) redirect("/login");

  return <Mainpage access={access} />;
}
