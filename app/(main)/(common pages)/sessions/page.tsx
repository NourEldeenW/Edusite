import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import Main from "./main";

export const metadata: Metadata = {
  title: "EduTrack | Sessions",
  description:
    "This page is for teachers and assistants to manage and creare sessions.",
};

export default async function MainPage() {
  const headerData = await headers();
  const role = headerData.get("x-user-role");
  if (role !== "teacher" && role !== "assistant")
    return redirect(`/${role}/dashboard`);

  const access = headerData.get("access");
  if (!access) redirect("/login");

  return (
    <>
      <Main access={access} />
    </>
  );
}
