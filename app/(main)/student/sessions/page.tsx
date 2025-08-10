import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import Main from "./_sessionscomps/main";

export const metadata: Metadata = {
  title: "EduTrack | Sessions",
  description:
    "This page is for students to view their sessions and attendance.",
};

export default async function stuSessions() {
  const headerData = await headers();
  const role = headerData.get("x-user-role");
  if (role !== "student") return redirect(`/${role}/dashboard`);

  const access = headerData.get("access");
  if (!access) redirect("/login");

  return (
    <>
      <Main access={access} />
    </>
  );
}
