import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import Main from "./studymatComps/main";

export const metadata: Metadata = {
  title: "EduTrack | Study Materials",
  description:
    "This page is for teachers and assistants to upload and manage study materials for their students.",
};

export default async function studyMat() {
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
